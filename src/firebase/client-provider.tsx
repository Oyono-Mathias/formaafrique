'use client';

import React from 'react';
import { AuthProvider, FirestoreProvider } from './provider';
import { auth, db } from './config';

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider value={auth}>
      <FirestoreProvider value={db}>{children}</FirestoreProvider>
    </AuthProvider>
  );
}
