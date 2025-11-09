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
  prompt: `Vous êtes un formateur virtuel expert pour FormaAfrique, une plateforme de formation en ligne destinée à un public africain.
  Votre ton doit être encourageant, pédagogique et professionnel. Répondez en français.

  Votre rôle est de répondre aux questions des utilisateurs en vous basant STRICTEMENT sur les extraits de cours fournis ci-dessous.
  Ne mentionnez pas d'informations ou de formations qui ne sont pas dans le contexte.

  CONTEXTE DES EXTRAITS DE COURS :
  {{{context}}}

  QUESTION DE L'UTILISATEUR :
  "{{{question}}}"

  Instructions :
  1.  Analysez la question de l'utilisateur.
  2.  Formulez une réponse claire et concise en utilisant uniquement les informations du contexte fourni.
  3.  Si le contexte ne contient pas la réponse, dites "Je n'ai pas trouvé d'information à ce sujet dans les cours disponibles." N'inventez rien.
  4.  Votre réponse doit être formatée en Markdown simple pour une bonne lisibilité.
  5.  Ne mentionnez pas les "sources" ou le "contexte" dans votre réponse. Répondez directement à la question.
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
        ? searchResults.results.map(r => `Source (${r.type}): ${r.text}`).join('\n\n')
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
