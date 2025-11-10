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
      // Note: In a real app, the module ID would be dynamic.
      const videoRef = db.doc(`formations/${courseId}/modules/MODULE_ID_PLACEHOLDER/videos/${videoId}`);
      const courseRef = db.doc(`formations/${courseId}`);
      const userProgressRef = db.doc(`users/${uid}/enrollments/${courseId}`);
      
      const courseSnap = await courseRef.get();
      if (!courseSnap.exists) throw new Error("Course not found");
      const authorId = courseSnap.data()?.authorId;
      if (!authorId) throw new Error("Author not found for the course");
      const formateurStatsRef = db.doc(`formateur_stats/${authorId}`);

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const dailyAnalyticsRef = db.doc(`analytics/${courseId}/daily_stats/${today}`);

      await db.runTransaction(async (transaction) => {
        // --- Get current data ---
        const userProgressDoc = await transaction.get(userProgressRef);
        const currentWatchTime = userProgressDoc.data()?.watchMinutes || 0;
        const newTotalWatchTime = currentWatchTime + watchMinutes;
        
        // --- Update all documents ---
        transaction.set(videoRef, { 
            views: admin.firestore.FieldValue.increment(1),
            totalWatchMinutes: admin.firestore.FieldValue.increment(watchMinutes)
        }, { merge: true });
        
        transaction.set(courseRef, { 
            totalViews: admin.firestore.FieldValue.increment(1),
            totalWatchMinutes: admin.firestore.FieldValue.increment(watchMinutes),
        }, { merge: true });
        
        transaction.update(userProgressRef, {
            watchMinutes: newTotalWatchTime,
            lastSeenAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        transaction.set(dailyAnalyticsRef, {
            videoViews: admin.firestore.FieldValue.increment(1),
            watchMinutes: admin.firestore.FieldValue.increment(watchMinutes),
        }, { merge: true });

        transaction.set(formateurStatsRef, { 
            totalWatchMinutes: admin.firestore.FieldValue.increment(watchMinutes) 
        }, { merge: true });
      });

      return { success: true, message: 'Analytics updated successfully.' };

    } catch (error: any) {
      console.error("Error in onVideoViewIncrement:", error.message, { data });
      // Re-throwing the error to be caught by the global error handler
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while updating analytics.',
        error.message
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

        const batch = db.batch();
        batch.set(courseRef, { enrolledCount: admin.firestore.FieldValue.increment(1) }, { merge: true });
        batch.set(formateurStatsRef, { totalStudents: admin.firestore.FieldValue.increment(1) }, { merge: true });
        batch.set(dailyAnalyticsRef, { newEnrollments: admin.firestore.FieldValue.increment(1) }, { merge: true });

        await batch.commit();
        console.log(`Successfully updated stats for new enrollment in course ${courseId}.`);

    } catch(error) {
        console.error(`Error in onNewEnrollment for course ${courseId}:`, error);
        // The global wrapper will catch and log this error.
        throw error;
    }
});
