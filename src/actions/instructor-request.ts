
'use server';

import { db } from '@/firebase/config';
import { collection, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { evaluateCandidate } from '@/ai/flows/evaluate-candidate-flow';
import { useToast } from '@/hooks/use-toast';

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
    // 1. Create the initial request document
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
      status: 'pending', // Set initial status to pending
      scoreReputation: userProfile.scoreReputation || 0,
    });

    // 2. Immediately trigger the AI evaluation after creation
    // This will run in the background and update the document with the score and feedback
    evaluateCandidate({ uid: uid })
      .then(result => {
        console.log(`AI Evaluation complete for ${uid}: Score ${result.score_final}, Status ${result.statut}`);
        // The flow itself updates the document, so no further action is needed here.
      })
      .catch(evalError => {
        console.error(`AI evaluation failed for ${uid}:`, evalError);
        // Optionally, update the request to note the evaluation failure
        updateDoc(requestDocRef, { status: 'pending', feedbackMessage: "L'évaluation automatique a échoué. En attente d'une révision manuelle." });
      });

  } catch (error) {
    console.error("Error creating instructor request:", error);
    throw new Error("Impossible de soumettre la candidature.");
  }
}
