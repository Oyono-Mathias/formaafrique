
'use server';
/**
 * @fileOverview A Genkit flow to evaluate a student's profile to determine their eligibility to become an instructor.
 *
 * - evaluateCandidate - The main function to call the evaluation flow.
 * - CandidateEvaluationInput - The Zod schema for the input.
 * - CandidateEvaluationOutput - The Zod schema for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { doc, getDoc, collection, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { UserProfile, Enrollment, InstructorRequest } from '@/lib/types';


// 1. Input Schema: We only need the user's ID to start the evaluation.
export const CandidateEvaluationInputSchema = z.object({
  uid: z.string().describe("The unique ID of the student being evaluated."),
});
export type CandidateEvaluationInput = z.infer<typeof CandidateEvaluationInputSchema>;

// 2. Output Schema: This precisely matches the requested JSON output structure.
export const CandidateEvaluationOutputSchema = z.object({
  score_final: z.number().describe("The final calculated eligibility score."),
  statut: z.enum(['éligible', 'en_attente', 'refusé']).describe("The final eligibility status."),
  message_feedback: z.string().describe("A personalized and encouraging feedback message for the candidate."),
  badge: z.string().optional().describe("A special badge if applicable, like 'Formateur YouTube'."),
});
export type CandidateEvaluationOutput = z.infer<typeof CandidateEvaluationOutputSchema>;


/**
 * A Genkit flow that evaluates a student's profile to see if they can become an instructor.
 * @param {CandidateEvaluationInput} input - The user's ID.
 * @returns {Promise<CandidateEvaluationOutput>} - The detailed evaluation result.
 */
export async function evaluateCandidate(input: CandidateEvaluationInput): Promise<CandidateEvaluationOutput> {
  return evaluateCandidateFlow(input);
}

// 3. Define the Prompt for the AI
const evaluationPrompt = ai.definePrompt({
  name: 'candidateEvaluationPrompt',
  input: { schema: z.object({
      nom: z.string(),
      biographie: z.string(),
      formations_terminees: z.number(),
      note_moyenne: z.number(),
      reseaux: z.object({
          facebook: z.boolean(),
          instagram: z.boolean(),
          twitter: z.boolean(),
          youtube: z.boolean(),
      })
  }) },
  output: { schema: CandidateEvaluationOutputSchema },
  prompt: `Tu es FormaIA, l'évaluateur intelligent de FormaAfrique. Ton rôle est d'analyser une candidature pour devenir formateur et de retourner un score, un statut, et un feedback constructif.

  **Données du candidat :**
  - Nom : {{nom}}
  - Biographie : "{{biographie}}"
  - Nombre de formations terminées : {{formations_terminees}}
  - Note moyenne (réputation) : {{note_moyenne}}/5
  - Réseaux connectés : Facebook: {{reseaux.facebook}}, Instagram: {{reseaux.instagram}}, Twitter/X: {{reseaux.twitter}}, YouTube: {{reseaux.youtube}}

  **Règles de notation :**
  1.  Biographie ≥ 100 caractères = +20 points
  2.  ≥ 3 formations terminées = +20 points
  3.  Note moyenne ≥ 4.5/5 = +20 points
  4.  Au moins 2 réseaux sociaux connectés (Facebook, Instagram, Twitter/X) = +20 points
  5.  YouTube ajouté = +10 points (bonus)
  6.  Facebook ET Instagram actifs = +10 points (bonus)
  Le score maximum est 100.

  **Règles de statut :**
  - **éligible :** Score final ≥ 70
  - **en_attente :** 50 ≤ Score final < 70
  - **refusé :** Score final < 50

  **Instructions de sortie :**
  1.  Calcule le \`score_final\` en appliquant rigoureusement le barème.
  2.  Détermine le \`statut\` ('éligible', 'en_attente', 'refusé') en fonction du score.
  3.  Si le critère YouTube est rempli, attribue le \`badge\` "Formateur YouTube".
  4.  **Rédige un \`message_feedback\` personnalisé, positif et motivant :**
      - Si 'éligible' : Félicite le candidat pour son excellent profil et indique que son dossier est transmis pour validation finale.
      - Si 'en_attente' : Encourage-le, mentionne son bon score et liste 1 ou 2 points spécifiques à améliorer pour atteindre le statut éligible (ex: "Termine encore une formation" ou "Connecte un réseau social de plus pour renforcer ton profil.").
      - Si 'refusé' : Sois bienveillant. Explique que le profil a du potentiel mais nécessite des améliorations. Liste clairement les points les plus importants à travailler (ex: "Complète ta biographie et termine quelques formations pour montrer ton expertise.").
  5.  Retourne un unique objet JSON valide avec tous les champs requis.
  `,
});


// 4. Define the Flow
const evaluateCandidateFlow = ai.defineFlow(
  {
    name: 'evaluateCandidateFlow',
    inputSchema: CandidateEvaluationInputSchema,
    outputSchema: CandidateEvaluationOutputSchema,
  },
  async (input) => {
    if (!db) throw new Error("Firestore is not initialized.");

    // Step 1: Fetch all required data from Firestore
    const userDocRef = doc(db, 'users', input.uid);
    const enrollmentsColRef = collection(db, 'users', input.uid, 'enrollments');
    const requestDocRef = doc(db, 'instructor_requests', input.uid);

    const [userDoc, enrollmentsSnap, requestDoc] = await Promise.all([
        getDoc(userDocRef),
        getDocs(query(enrollmentsColRef, where("progression", ">=", 100))),
        getDoc(requestDocRef),
    ]);

    if (!userDoc.exists()) {
        throw new Error(`User profile not found for UID: ${input.uid}`);
    }

    const userProfile = userDoc.data() as UserProfile;
    const request = requestDoc.exists() ? requestDoc.data() as InstructorRequest : {} as Partial<InstructorRequest>;
    const socialLinks = request.socialLinks || (userProfile as any).socialLinks || {};


    // Step 2: Prepare data for the AI prompt
    const promptInput = {
        nom: userProfile.name,
        biographie: userProfile.bio || '',
        formations_terminees: enrollmentsSnap.docs.length,
        note_moyenne: userProfile.scoreReputation || 3.5, // Default to 3.5 if not set
        reseaux: {
            facebook: !!socialLinks.facebookUrl,
            instagram: !!socialLinks.instagramUrl,
            twitter: !!socialLinks.twitterUrl,
            youtube: !!socialLinks.youtubeUrl,
        }
    };

    // Step 3: Call the AI prompt with the prepared data
    const { output } = await evaluationPrompt(promptInput);

    if (!output) {
      throw new Error("Candidate evaluation flow failed to produce an output.");
    }
    
    // Step 4: Update the instructor request document with the AI's evaluation (if it exists)
    if (requestDoc.exists()) {
        await updateDoc(requestDocRef, {
            scoreFinal: output.score_final,
            status: output.statut, // Update status based on AI evaluation
            feedbackMessage: output.message_feedback,
        });
    }
    
    console.log(`Evaluation for ${userProfile.name} completed. Score: ${output.score_final}, Status: ${output.statut}`);
    return output;
  }
);
