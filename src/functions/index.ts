/**
 * @fileoverview Main entry point for all Firebase Cloud Functions.
 * This file imports and exports functions from other modules,
 * making them available for deployment.
 */

// Initialize Firebase Admin SDK
import * as admin from 'firebase-admin';
admin.initializeApp();
const db = admin.firestore();

// Global error logger
const logErrorToFirestore = async (error: Error, context: any) => {
    try {
        await db.collection('admin_notifications').add({
            type: 'function_error',
            title: `Erreur dans la fonction : ${context.functionName}`,
            message: error.message || 'Une erreur inconnue est survenue.',
            details: {
                stack: error.stack,
                context: JSON.stringify(context, null, 2),
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
        });
        console.error("Successfully logged error to Firestore:", error.message);
    } catch (loggingError) {
        console.error("CRITICAL: Failed to log error to Firestore:", loggingError);
        console.error("Original Error was:", error);
    }
}

// Wrapper function to add error handling to all Cloud Functions
function wrapHttpsFunction<T, R>(fn: (data: T, context: any) => Promise<R>) {
    return async (data: T, context: any) => {
        try {
            return await fn(data, context);
        } catch (error: any) {
            await logErrorToFirestore(error, context);
            // Re-throw the original error to ensure the client gets an error response
            throw error;
        }
    };
}

function wrapEventFunction<T>(fn: (snap: T, context: any) => Promise<any>) {
    return async (snap: T, context: any) => {
        try {
            return await fn(snap, context);
        } catch (error: any) {
            // For event-driven functions, logging is sufficient.
            await logErrorToFirestore(error, context);
        }
    };
}


// Import and export functions from their respective modules, wrapped with error handling
import * as analyticsFunctions from './analytics';
import * as scheduledFunctions from './scheduled';
import * as paymentFunctions from './payments';

export const onVideoViewIncrement = analyticsFunctions.onVideoViewIncrement;
export const onNewEnrollment = analyticsFunctions.onNewEnrollment;
export const scheduledDailyAggregator = scheduledFunctions.scheduledDailyAggregator;
export const onDonationWebhook = paymentFunctions.onDonationWebhook;
