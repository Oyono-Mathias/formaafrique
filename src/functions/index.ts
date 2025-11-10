/**
 * @fileoverview Main entry point for all Firebase Cloud Functions.
 * This file imports and exports functions from other modules,
 * making them available for deployment.
 */

// Initialize Firebase Admin SDK
import * as admin from 'firebase-admin';
admin.initializeApp();

// Import and export functions from their respective modules
export * from './analytics';
export * from './scheduled';
export * from './payments';
