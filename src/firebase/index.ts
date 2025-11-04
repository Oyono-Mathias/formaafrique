'use client';
import { useAuth, useFirestore, useUserContext, useStorage } from './provider';
import { UserProvider } from './provider';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import type { UserProfile } from '@/lib/types';

// This is a custom hook that simplifies getting the user data
const useUser = () => {
  const { user, userProfile, loading } = useUserContext();
  return { user, userProfile: userProfile as UserProfile | null, loading };
};

export { useAuth, useFirestore, useUser, UserProvider, useCollection, useDoc, useStorage };
