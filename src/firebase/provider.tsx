'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Auth, User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          await setDoc(userDocRef, { online: true, lastSeen: serverTimestamp() }, { merge: true });
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile({ id: userDoc.id, ...userDoc.data() } as UserProfile);
          } else {
            // This case might happen if the doc creation failed on signup.
            // We can attempt to recreate it.
            const newUserProfile: Omit<UserProfile, 'createdAt' | 'photoURL'> & { createdAt: any, photoURL: string | null } = {
                name: firebaseUser.displayName || 'Nouvel Utilisateur',
                email: firebaseUser.email!,
                createdAt: serverTimestamp(),
                role: 'etudiant',
                status: 'actif',
                paysOrigine: '',
                paysActuel: '',
                bio: '',
                skills: [],
                friends: [],
                followers: [],
                following: [],
                online: true,
                lastSeen: serverTimestamp(),
                photoURL: firebaseUser.photoURL || null,
            };
            await setDoc(userDocRef, newUserProfile);
            setUserProfile({ id: userDocRef.id, ...newUserProfile } as UserProfile);
          }
        } catch (error) {
          console.error("Failed to fetch or update user profile:", error);
          setUserProfile(null);
        }
      } else {
        if (user) {
            // User is signing out
            const userDocRef = doc(db, 'users', user.uid);
            setDoc(userDocRef, { online: false, lastSeen: serverTimestamp() }, { merge: true });
        }
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db, user]);

  return (
    <UserContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
