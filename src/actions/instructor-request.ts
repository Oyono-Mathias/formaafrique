
'use server';

import { db } from '@/firebase/config';
import { collection, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

interface RequestPayload {
  uid: string;
  specialite: string;
  motivation: string;
  videoUrl: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
}

export async function createInstructorRequest(payload: RequestPayload) {
  if (!payload.uid) {
    throw new Error("L'ID de l'utilisateur est manquant.");
  }
  
  const userDocRef = doc(db, 'users', payload.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    throw new Error("Utilisateur non trouvé.");
  }

  const userProfile = userDoc.data() as UserProfile;
  const { uid, ...formData } = payload;
  
  try {
    const requestDocRef = doc(db, 'instructor_requests', uid);
    await setDoc(requestDocRef, {
      userId: uid,
      userName: userProfile.name,
      userEmail: userProfile.email,
      specialite: formData.specialite,
      motivation: formData.motivation,
      videoUrl: formData.videoUrl,
      socialLinks: {
        facebookUrl: formData.facebookUrl || '',
        instagramUrl: formData.instagramUrl || '',
        twitterUrl: formData.twitterUrl || '',
        youtubeUrl: formData.youtubeUrl || '',
      },
      requestDate: serverTimestamp(),
      status: 'pending',
      scoreReputation: userProfile.scoreReputation || 0,
    });
  } catch (error) {
    console.error("Error creating instructor request:", error);
    throw new Error("Impossible de soumettre la candidature.");
  }
}
