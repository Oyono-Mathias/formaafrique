/**
 * @fileoverview Cloud Functions for real-time analytics aggregation.
 * These functions are triggered by user actions like viewing videos or enrolling in courses.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * =====================================================================================
 * A) onVideoViewIncrement - Increment view counts and watch time across the database.
 * =====================================================================================
 * @description A callable function triggered by the client-side player. It performs
 * multiple atomic updates to keep analytics data consistent.
 *
 * @usage Called by the client player periodically during video playback.
 */
export const onVideoViewIncrement = functions
  .region('europe-west1') // Example region
  .https.onCall(async (data: { videoId: string; courseId: string; watchMinutes: number }, context) => {
    // 1. Security Check: Ensure the user is authenticated.
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }
    
    const { videoId, courseId, watchMinutes } = data;
    const uid = context.auth.uid;

    if (!videoId || !courseId || watchMinutes === undefined) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Missing required parameters: videoId, courseId, watchMinutes.'
        );
    }

    try {
      const courseRef = db.doc(`formations/${courseId}`);
      const videoRef = db.doc(`formations/${courseId}/modules/MODULE_ID_PLACEHOLDER/videos/${videoId}`); // Note: Path needs to be more robust
      const userProgressRef = db.doc(`users/${uid}/enrollments/${courseId}`);

      // In a real scenario, you would fetch the course to get the authorId
      const courseSnap = await courseRef.get();
      if (!courseSnap.exists) throw new Error("Course not found");
      const authorId = courseSnap.data()?.authorId;
      const formateurStatsRef = db.doc(`formateur_stats/${authorId}`);

      // Daily analytics document
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const dailyAnalyticsRef = db.doc(`analytics/${courseId}/daily_stats/${today}`);


      // 2. Perform atomic updates using a transaction
      await db.runTransaction(async (transaction) => {
        const userProgressDoc = await transaction.get(userProgressRef);
        const currentProgress = userProgressDoc.data()?.progression || 0;
        const currentWatchTime = userProgressDoc.data()?.watchMinutes || 0;

        // Recalculate progress (example logic)
        const newTotalWatchTime = currentWatchTime + watchMinutes;
        // const totalCourseDuration = ... (fetch this or store on course doc)
        // const newPercentage = (newTotalWatchTime / totalCourseDuration) * 100;
        
        // Update documents
        transaction.update(videoRef, { views: admin.firestore.FieldValue.increment(1) });
        transaction.update(courseRef, { 
            totalViews: admin.firestore.FieldValue.increment(1),
            totalWatchMinutes: admin.firestore.FieldValue.increment(watchMinutes),
        });
        transaction.update(userProgressRef, {
            watchMinutes: newTotalWatchTime,
            // progression: newPercentage,
            lastSeenAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        transaction.set(dailyAnalyticsRef, {
            videoViews: admin.firestore.FieldValue.increment(1),
            watchMinutes: admin.firestore.FieldValue.increment(watchMinutes),
        }, { merge: true });
        transaction.update(formateurStatsRef, { totalWatchMinutes: admin.firestore.FieldValue.increment(watchMinutes) });
      });

      // 3. Return a success response
      return { success: true, message: 'Analytics updated successfully.' };

    } catch (error) {
      console.error("Error in onVideoViewIncrement:", error);
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while updating analytics.'
      );
    }
});


/**
 * =====================================================================================
 * B) onNewEnrollment - Triggered when a user enrolls in a course.
 * =====================================================================================
 * @description A Firestore trigger that updates aggregated stats when a new
 * enrollment document is created.
 */
export const onNewEnrollment = functions
  .region('europe-west1')
  .firestore.document('users/{userId}/enrollments/{courseId}')
  .onCreate(async (snap, context) => {
    const { courseId } = context.params;
    
    const courseRef = db.doc(`formations/${courseId}`);
    const today = new Date().toISOString().split('T')[0];
    const dailyAnalyticsRef = db.doc(`analytics/${courseId}/daily_stats/${today}`);

    try {
        const courseSnap = await courseRef.get();
        if (!courseSnap.exists) {
            console.error(`Course ${courseId} not found.`);
            return;
        }
        const authorId = courseSnap.data()?.authorId;
        if (!authorId) {
            console.error(`Author not found for course ${courseId}.`);
            return;
        }
        const formateurStatsRef = db.doc(`formateur_stats/${authorId}`);

        // Batch updates
        const batch = db.batch();
        batch.update(courseRef, { enrolledCount: admin.firestore.FieldValue.increment(1) });
        batch.update(formateurStatsRef, { totalStudents: admin.firestore.FieldValue.increment(1) });
        batch.set(dailyAnalyticsRef, { newEnrollments: admin.firestore.FieldValue.increment(1) }, { merge: true });

        await batch.commit();
        console.log(`Successfully updated stats for new enrollment in course ${courseId}.`);

    } catch(error) {
        console.error(`Error in onNewEnrollment for course ${courseId}:`, error);
    }
});
