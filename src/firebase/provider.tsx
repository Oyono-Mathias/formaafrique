'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Auth, User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// Auth context
const AuthContext = createContext<Auth | undefined>(undefined);
export const AuthProvider = AuthContext.Provider;
export const useAuth = () => useContext(AuthContext);

// Firestore context
const FirestoreContext = createContext<Firestore | undefined>(undefined);
export const FirestoreProvider = FirestoreContext.Provider;
export const useFirestore = () => useContext(FirestoreContext);

// User context
const UserContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
