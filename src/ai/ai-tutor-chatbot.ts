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
  prompt: `System: Tu es FormaTutor, un assistant pédagogique expert pour FormaAfrique. Tu es patient, clair et encourageant.
Règles strictes :
1. Base TOUJOURS ta réponse EXCLUSIVEMENT sur les "CONTEXTES PERTINENTS" fournis.
2. Si le contexte ne permet pas de répondre, dis-le clairement : "Je n'ai pas trouvé d'information à ce sujet dans les cours disponibles." N'invente JAMAIS d'information.
3. Si le contexte est suffisant, réponds en 3 à 6 phrases simples.
4. Après ta réponse, propose une action concrète à l'utilisateur, comme "Je te suggère de regarder la vidéo [Titre de la vidéo] pour approfondir."
5. NE JAMAIS suggérer de contacter qui que ce soit en dehors de la plateforme ou de faire des paiements.

User Query:
"{{{question}}}"

CONTEXTES PERTINENTS:
{{{context}}}

Instruction:
Génère une réponse pédagogique en suivant toutes les règles ci-dessus.
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
