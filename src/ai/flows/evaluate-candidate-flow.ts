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

// 1. Input Schema: We only need the user's ID to start the evaluation.
export const CandidateEvaluationInputSchema = z.object({
  uid: z.string().describe("The unique ID of the student being evaluated."),
  // We'll add the raw data inside the flow for the prompt.
});
export type CandidateEvaluationInput = z.infer<typeof CandidateEvaluationInputSchema>;

// 2. Output Schema: This precisely matches the requested JSON output structure.
export const CandidateEvaluationOutputSchema = z.object({
  uid: z.string().describe("The user's ID."),
  nom: z.string().describe("The user's full name."),
  formations_terminees: z.number().describe("The number of courses the user has completed."),
  note_moyenne: z.number().describe("The user's average score or reputation."),
  reseaux_connectes: z.array(z.string()).describe("A list of connected social media platforms."),
  score_final: z.number().describe("The final calculated eligibility score."),
  statut: z.enum(['éligible', 'en_attente', 'refusé']).describe("The final eligibility status."),
  badge: z.string().optional().describe("A special badge if applicable, like 'Formateur YouTube'."),
  feedback_message: z.string().describe("A personalized and encouraging feedback message for the candidate."),
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
  // The prompt's input will be a richer object containing all the data the AI needs.
  input: { schema: z.object({
      uid: z.string(),
      nom: z.string(),
      email_verifie: z.boolean(),
      photo_presente: z.boolean(),
      biographie: z.string(),
      formations_terminees: z.number(),
      note_moyenne: z.number(),
      reseaux_sociaux: z.object({
          Facebook: z.boolean(),
          Instagram: z.boolean(),
          Twitter: z.boolean(),
          YouTube: z.boolean(),
      })
  }) },
  output: { schema: CandidateEvaluationOutputSchema },
  prompt: `Tu es l’assistant IA de FormaAfrique, chargé d’analyser les profils des étudiants pour déterminer s’ils peuvent devenir formateurs.

  **Objectif :**
  Évalue le profil de l'étudiant fourni ci-dessous en fonction de critères stricts et retourne un objet JSON complet contenant le statut, le score, les détails et un message de feedback.

  **Données de l'étudiant :**
  - Nom : {{nom}}
  - UID : {{uid}}
  - Email vérifié : {{email_verifie}}
  - Photo de profil présente : {{photo_presente}}
  - Biographie : "{{biographie}}"
  - Formations terminées (score > 80%) : {{formations_terminees}}
  - Note moyenne (réputation) : {{note_moyenne}}/5
  - Réseaux connectés : Facebook: {{reseaux_sociaux.Facebook}}, Instagram: {{reseaux_sociaux.Instagram}}, Twitter/X: {{reseaux_sociaux.Twitter}}, YouTube: {{reseaux_sociaux.YouTube}}

  **Critères d'évaluation :**
  1.  **Prérequis (obligatoires) :**
      - Email vérifié.
      - Photo de profil présente.
      - Biographie d'au moins 100 caractères.
  2.  **Performance (doit remplir au moins une des deux conditions) :**
      - Avoir terminé au moins 3 formations.
      - Avoir un score global (note moyenne) de 4.5/5 ou plus.
  3.  **Professionnalisme :**
      - Avoir connecté au moins 2 réseaux professionnels (Facebook, Instagram, Twitter/X).
  4.  **Bonus :**
      - Si YouTube est connecté, un badge "Formateur YouTube" est attribué.

  **Calcul du statut :**
  - **éligible :** TOUS les critères (Prérequis, Performance, Professionnalisme) sont remplis.
  - **refusé :** Un ou plusieurs des "Prérequis" manquent.
  - **en_attente :** Les "Prérequis" sont remplis, mais le critère "Performance" ou "Professionnalisme" ne l'est pas.

  **Calcul du Score Final (sur 100) :**
  Score = (Note_Moyenne * 12) + (Formations_Terminées * 4) + (Biographie_OK * 10) + (Réseaux_OK * 10)
  - "Biographie_OK" vaut 1 si la bio a ≥ 100 caractères, sinon 0.
  - "Réseaux_OK" vaut 1 si au moins 2 réseaux sont connectés, sinon 0.
  Le score est un indicateur, le statut prime.

  **Instructions de sortie :**
  1.  Analyse les données et les critères.
  2.  Calcule le `score_final`.
  3.  Détermine le `statut` ('éligible', 'en_attente', 'refusé').
  4.  Attribue le `badge` si le critère YouTube est rempli.
  5.  **Rédige un `feedback_message` personnalisé et motivant :**
      - Si 'éligible' : Félicite le candidat et invite-le à postuler.
      - Si 'en_attente' : Encourage-le et liste clairement les 1 ou 2 points principaux à améliorer pour devenir éligible (ex: "Termine encore une formation" ou "Connecte un réseau social de plus").
      - Si 'refusé' : Sois bienveillant, explique poliment que les prérequis ne sont pas remplis (ex: "Complète ta biographie et ajoute une photo de profil"), et encourage-le à revenir.
  6.  Retourne un unique objet JSON valide avec tous les champs requis.
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
    // In a real application, you would fetch this data from Firestore based on the input.uid.
    // For this example, we use mock data.
    console.log(`Evaluating candidate with UID: ${input.uid}`);
    
    // MOCK DATA - Remplacer par des appels Firestore
    const studentData = {
      uid: input.uid,
      nom: "Jean Dupont",
      email_verifie: true,
      photo_presente: true,
      biographie: "Passionné par la technologie et l'éducation, je souhaite partager mes connaissances pour aider les autres à grandir. J'ai 5 ans d'expérience en développement web.",
      formations_terminees: 4,
      note_moyenne: 4.7,
      reseaux_sociaux: {
        Facebook: true,
        Instagram: false,
        Twitter: false,
        YouTube: true,
      },
    };

    // Call the AI prompt with the fetched/mocked data.
    const { output } = await evaluationPrompt(studentData);

    if (!output) {
      throw new Error("Candidate evaluation flow failed to produce an output.");
    }
    
    console.log("Evaluation result:", output);
    return output;
  }
);
