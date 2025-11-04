'use client';

import React from 'react';
import { AuthProvider, FirestoreProvider, StorageProvider } from './provider';
import { auth, db, storage } from './config';

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider value={auth}>
      <FirestoreProvider value={db}>
        <StorageProvider value={storage}>
            {children}
        </StorageProvider>
      </FirestoreProvider>
    </AuthProvider>
  );
}
