'use server';

/**
 * @fileOverview AI tutor chatbot flow that answers questions about course content and provides guidance.
 *
 * - aiTutorChatbot - A function that handles the AI tutor chatbot interaction.
 * - AiTutorChatbotInput - The input type for the aiTutorChatbot function.
 * - AiTutorChatbotOutput - The return type for the aiTutorChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { vectorSearch } from './flows/vector-search-flow';

const AiTutorChatbotInputSchema = z.object({
  question: z.string().describe('The user question about the course content.'),
  // courseContent is now deprecated, as we will fetch it dynamically.
  courseContent: z.string().optional().describe('A summary of the available course categories and examples.'),
  formationId: z.string().optional().describe('Optional ID of the current course for context.'),
});
export type AiTutorChatbotInput = z.infer<typeof AiTutorChatbotInputSchema>;

const AiTutorChatbotOutputSchema = z.object({
  answer: z.string().describe('The helpful and concise answer from the AI tutor chatbot.'),
  sources: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
  })).optional().describe('A list of sources used to generate the answer.'),
});
export type AiTutorChatbotOutput = z.infer<typeof AiTutorChatbotOutputSchema>;

export async function aiTutorChatbot(input: AiTutorChatbotInput): Promise<AiTutorChatbotOutput> {
  return aiTutorChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTutorChatbotPrompt',
  input: {schema: z.object({
      question: z.string(),
      context: z.string(),
  })},
  output: {schema: AiTutorChatbotOutputSchema},
  prompt: `System: Tu es FormaTutor, l'assistant pédagogique officiel de FormaAfrique. Tu es un formateur professionnel, clair, patient, avec un ton encourageant, adapté aux débutants. Tu connais toutes les formations, modules et titres de vidéos.
  Règles strictes:
  1. Base TOUJOURS ta réponse sur les "CONTEXTES EXTRAITS" fournis. Si le contexte ne répond pas à la question, dis-le clairement. N'invente rien.
  2. Précise ta source (ex: "D'après la vidéo X du module Y...").
  3. Propose 1 à 2 ressources internes pertinentes (vidéo/module) si le contexte le permet.
  4. Propose un court exercice pratique en lien avec la question.
  5. Termine avec un appel à l'action clair (ex: "Je te suggère de commencer par le module X.").
  6. NE JAMAIS inviter à un contact externe (email, WhatsApp) ou à des paiements hors plateforme.

  User Query:
  "{{{question}}}"

  Retrieved contexts:
  {{{context}}}

  Instruction:
  Répond de façon pédagogique en français, simple, en 3 à 6 phrases. Ensuite, propose une action concrète à l'utilisateur (par exemple, "regarde la vidéo X" ou "fais cet exercice").
  `,
});

const aiTutorChatbotFlow = ai.defineFlow(
  {
    name: 'aiTutorChatbotFlow',
    inputSchema: AiTutorChatbotInputSchema,
    outputSchema: AiTutorChatbotOutputSchema,
  },
  async (input) => {
    // Step 1: Perform vector search to find relevant context
    const searchResults = await vectorSearch({
        query: input.question,
        formationId: input.formationId,
        topK: 3,
    });
    
    // Step 2: Format the context for the LLM
    const context = searchResults.results.length > 0 
        ? searchResults.results.map(r => `Source (type: ${r.type}, titre: ${r.meta?.title}): ${r.text}`).join('\n\n')
        : "Aucune information pertinente trouvée dans la base de connaissances.";

    // Step 3: Generate the answer using the retrieved context
    const { output } = await prompt({
        question: input.question,
        context: context,
    });

    if (!output) {
      throw new Error("AI Tutor flow failed to generate an answer.");
    }
    
    // Step 4: Return the answer and the sources used
    return {
        ...output,
        sources: searchResults.results.map(r => ({ id: r.id, type: r.type, title: r.meta?.title || 'Source' }))
    };
  }
);
