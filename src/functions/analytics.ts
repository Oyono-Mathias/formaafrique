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
export const onVideoViewIncrement = async (data: { videoId: string; courseId: string; watchMinutes: number }, context: functions.https.CallableContext) => {
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

    // In a real app, you would need a way to find which module the video belongs to.
    // This part is simplified as we don't have that link readily available here.
    // A robust solution might involve a `videos` root collection with `moduleId` and `courseId`.
    // For now, this function will fail if it can't guess the path, which is intended for this example.
    
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
      // We are not updating video-specific stats as the path is unknown.
      
      transaction.set(courseRef, { 
          totalViews: admin.firestore.FieldValue.increment(1),
          totalWatchMinutes: admin.firestore.FieldValue.increment(watchMinutes),
      }, { merge: true });
      
      transaction.update(userProgressRef, {
          watchMinutes: newTotalWatchTime,
          lastSeenAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      transaction.set(dailyAnalyticsRef, {
          date: today,
          courseId: courseId,
          videoViews: admin.firestore.FieldValue.increment(1),
          watchMinutes: admin.firestore.FieldValue.increment(watchMinutes),
      }, { merge: true });

      transaction.set(formateurStatsRef, { 
          totalWatchMinutes: admin.firestore.FieldValue.increment(watchMinutes) 
      }, { merge: true });
    });

    return { success: true, message: 'Analytics updated successfully.' };
};


/**
 * =====================================================================================
 * B) onNewEnrollment - Triggered when a user enrolls in a course.
 * =====================================================================================
 * @description A Firestore trigger that updates aggregated stats when a new
 * enrollment document is created.
 */
export const onNewEnrollment = async (snap: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const { courseId } = context.params;
    
    const courseRef = db.doc(`formations/${courseId}`);
    const today = new Date().toISOString().split('T')[0];
    const dailyAnalyticsRef = db.doc(`analytics/${courseId}/daily_stats/${today}`);

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
    batch.set(dailyAnalyticsRef, { date: today, courseId: courseId, newEnrollments: admin.firestore.FieldValue.increment(1) }, { merge: true });

    await batch.commit();
    console.log(`Successfully updated stats for new enrollment in course ${courseId}.`);
};
