'use client';

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

// This function initializes Firebase and handles the case where config is missing.
function initializeFirebase() {
    // Check if all required config values are present
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
        if (getApps().length === 0) {
            try {
                return initializeApp(firebaseConfig);
            } catch (e) {
                console.error("Erreur lors de l'initialisation de Firebase:", e);
                return undefined;
            }
        } else {
            return getApp();
        }
    } else {
        // We are printing a warning here because the app is expected to fail in some places
        // if Firebase is not configured. This is not a critical error.
        if (typeof window !== 'undefined') {
            console.warn("ATTENTION : La configuration de Firebase est manquante. Certaines fonctionnalités ne marcheront pas. Veuillez créer et configurer votre fichier .env.local.");
        }
        return undefined;
    }
}

// Initialize Firebase safely
app = initializeFirebase();
if (app) {
    auth = getAuth(app);
    db = getFirestore(app);
}

export { app, auth, db };
