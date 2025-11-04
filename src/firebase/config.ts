
"use client";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// A flag to check if the Firebase configuration is provided.
export const isFirebaseConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;


const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

if (!isFirebaseConfigured) {
    if (typeof window !== 'undefined') {
        console.warn("ATTENTION : La configuration de Firebase est manquante. L'authentification et la base de données ne fonctionneront pas. Veuillez créer et configurer votre fichier .env.local.");
    }
}
