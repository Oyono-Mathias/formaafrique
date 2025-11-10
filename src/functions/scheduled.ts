/**
 * @fileoverview Scheduled Cloud Functions that run on a recurring basis (cron jobs).
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * =====================================================================================
 * C) scheduledDailyAggregator - Daily data aggregation task.
 * =====================================================================================
 * @description A scheduled function that runs once a day to aggregate daily statistics
 * into a summary document. This is useful for building historical analytics dashboards.
 *
 * @usage Runs automatically every day at 00:10 UTC.
 */
export const scheduledDailyAggregator = functions
  .region('europe-west1')
  .pubsub.schedule('10 0 * * *') // Runs daily at 00:10 UTC
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Running scheduledDailyAggregator...');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD

    try {
        // In a real-world scenario, you would iterate through all courses.
        // For this skeleton, we'll imagine we have a list of course IDs.
        const coursesSnapshot = await db.collection('formations').get();
        
        for (const courseDoc of coursesSnapshot.docs) {
            const courseId = courseDoc.id;
            const dailyStatsRef = db.doc(`analytics/${courseId}/daily_stats/${dateStr}`);
            const dailyStatsSnap = await dailyStatsRef.get();

            if (dailyStatsSnap.exists) {
                const dailyData = dailyStatsSnap.data();
                const summaryRef = db.doc(`analytics_summaries/${dateStr}/${courseId}`);

                // Persist the daily summary
                await summaryRef.set({
                    courseId: courseId,
                    date: dateStr,
                    ...dailyData
                }, { merge: true });

                console.log(`Aggregated daily stats for course ${courseId} for date ${dateStr}.`);
            }
        }

        console.log('Daily aggregation completed successfully.');
        return null;

    } catch (error) {
      console.error('Error in scheduledDailyAggregator:', error);
      return null;
    }
  });
