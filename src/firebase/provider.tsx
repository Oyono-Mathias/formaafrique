'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Auth, User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

// Auth context
const AuthContext = createContext<Auth | undefined>(undefined);
export const AuthProvider = AuthContext.Provider;
export const useAuth = () => useContext(AuthContext);

// Firestore context
const FirestoreContext = createContext<Firestore | undefined>(undefined);
export const FirestoreProvider = FirestoreContext.Provider;
export const useFirestore = () => useContext(FirestoreContext);

// Storage context
const StorageContext = createContext<FirebaseStorage | undefined>(undefined);
export const StorageProvider = StorageContext.Provider;
export const useStorage = () => useContext(StorageContext);


// User context
interface UserContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  return (
    <UserContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
