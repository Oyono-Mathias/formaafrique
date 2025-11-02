'use client';
import { useAuth, useFirestore, useUserContext } from './provider';
import { UserProvider } from './provider';

// This is a custom hook that simplifies getting the user data
const useUser = () => {
  const { user, loading } = useUserContext();
  return { user, loading };
};

export { useAuth, useFirestore, useUser, UserProvider };
