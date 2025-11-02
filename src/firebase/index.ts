'use client';
import { useAuth, useFirestore, useUserContext } from './provider';
import { UserProvider } from './provider';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';

// This is a custom hook that simplifies getting the user data
const useUser = () => {
  const { user, loading } = useUserContext();
  return { user, loading };
};

export { useAuth, useFirestore, useUser, UserProvider, useCollection, useDoc };
