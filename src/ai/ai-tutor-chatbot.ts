'use server';

/**
 * @fileOverview AI tutor chatbot flow that answers questions about course content and provides guidance.
 *
 * - aiTutorChatbot - A function that handles the AI tutor chatbot interaction.
 * - AiTutorChatbotInput - The input type for the aiTutorChatbot function.
 * - AiTutorChatbotOutput - The return type for the aiTutorChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTutorChatbotInputSchema = z.object({
  question: z.string().describe('The user question about the course content.'),
  courseContent: z.string().describe('A summary of the available course categories and examples.'),
});
export type AiTutorChatbotInput = z.infer<typeof AiTutorChatbotInputSchema>;

const AiTutorChatbotOutputSchema = z.object({
  answer: z.string().describe('The helpful and concise answer from the AI tutor chatbot.'),
});
export type AiTutorChatbotOutput = z.infer<typeof AiTutorChatbotOutputSchema>;

export async function aiTutorChatbot(input: AiTutorChatbotInput): Promise<AiTutorChatbotOutput> {
  return aiTutorChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTutorChatbotPrompt',
  input: {schema: AiTutorChatbotInputSchema},
  output: {schema: AiTutorChatbotOutputSchema},
  prompt: `Vous êtes un formateur virtuel expert pour FormaAfrique, une plateforme de formation en ligne destinée à un public africain.
  Votre ton doit être encourageant, pédagogique et professionnel. Répondez en français.

  Votre rôle est de guider les utilisateurs, de répondre à leurs questions sur les formations disponibles et de donner des conseils pratiques.
  Basez-vous sur le contexte des formations de FormaAfrique fourni ci-dessous. Ne mentionnez pas de formations qui ne sont pas dans la liste.

  CONTEXTE DES FORMATIONS :
  {{{courseContent}}}

  QUESTION DE L'UTILISATEUR :
  "{{{question}}}"

  Instructions :
  1.  Analysez la question de l'utilisateur.
  2.  Si la question concerne une ou plusieurs catégories de formation, mentionnez-les et donnez des exemples concrets de ce que l'on peut y apprendre, en gardant à l'esprit le contexte africain.
  3.  Si la question est plus générale, fournissez une réponse utile et guidez l'utilisateur vers les catégories pertinentes.
  4.  Soyez concis et allez droit au but. N'inventez pas de formations.
  5.  Votre réponse doit être formatée en Markdown simple pour une bonne lisibilité.
  `,
});

const aiTutorChatbotFlow = ai.defineFlow(
  {
    name: 'aiTutorChatbotFlow',
    inputSchema: AiTutorChatbotInputSchema,
    outputSchema: AiTutorChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
