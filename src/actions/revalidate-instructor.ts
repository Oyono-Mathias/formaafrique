
'use server';

import { db } from '@/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { evaluateCandidate } from '@/ai/flows/evaluate-candidate-flow';
import type { InstructorProfile } from '@/lib/types';

interface RevalidationPayload {
  uid: string;
  bio: string;
  videoUrl: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
}

export async function revalidateInstructor(payload: RevalidationPayload) {
  if (!payload.uid) {
    throw new Error("L'ID de l'utilisateur est manquant.");
  }

  const { uid, ...formData } = payload;
  const userDocRef = doc(db, 'users', uid);

  try {
    // 1. Update the user's profile with the new information
    await updateDoc(userDocRef, {
        bio: formData.bio,
        videoUrl: formData.videoUrl, // Assuming you add this field to UserProfile
        socialLinks: {
            facebookUrl: formData.facebookUrl || '',
            instagramUrl: formData.instagramUrl || '',
            twitterUrl: formData.twitterUrl || '',
            youtubeUrl: formData.youtubeUrl || '',
        },
    });

    // 2. Trigger the AI evaluation flow
    const evaluationResult = await evaluateCandidate({ uid });

    // 3. Update the user's validation status based on the AI's feedback
    // Set to 'pending' to require admin final approval.
    await updateDoc(userDocRef, {
      score_validation: evaluationResult.score_final,
      validation_status: 'pending', // Awaiting admin review
      derniere_mise_a_jour: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error("Error during instructor revalidation:", error);
    throw new Error("Impossible de mettre à jour et de réévaluer le profil.");
  }
}
