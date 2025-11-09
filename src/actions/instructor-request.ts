
'use server';

import { db, auth } from '@/firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import type { User } from 'firebase/auth';

interface RequestPayload {
  specialite: string;
  motivation: string;
  videoUrl: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
}

export async function createInstructorRequest(payload: RequestPayload) {
  // This is a server action, auth().currentUser won't work.
  // In a real app, you'd get the user from a session or by passing the UID.
  // For now, we'll assume this can only be called by a logged-in user and proceed without direct auth check here.
  // The check is performed on the client-side before calling this action.

  // A more robust way would be to use Next-Auth or verify an ID token.
  // We simulate getting user info that would have been passed from the client.
  
  // This is a placeholder. In a real app, you'd get this from a proper session management.
  // const user = await getSessionUser(); // Fictional function
  // if (!user) throw new Error("Utilisateur non authentifié.");

  const { specialite, motivation, videoUrl, ...socialLinks } = payload;
  
  try {
    await addDoc(collection(db, 'instructor_requests'), {
      // userId: user.uid,
      // userName: user.name,
      // userEmail: user.email,
      specialite,
      motivation,
      videoUrl,
      socialLinks: socialLinks || {},
      requestDate: serverTimestamp(),
      status: 'pending',
      scoreReputation: 0, // Placeholder
    });
  } catch (error) {
    console.error("Error creating instructor request:", error);
    throw new Error("Impossible de soumettre la candidature.");
  }
}
