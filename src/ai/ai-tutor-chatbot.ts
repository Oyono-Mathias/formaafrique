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
  courseContent: z.string().describe('The content of the course.'),
});
export type AiTutorChatbotInput = z.infer<typeof AiTutorChatbotInputSchema>;

const AiTutorChatbotOutputSchema = z.object({
  answer: z.string().describe('The answer from the AI tutor chatbot.'),
});
export type AiTutorChatbotOutput = z.infer<typeof AiTutorChatbotOutputSchema>;

export async function aiTutorChatbot(input: AiTutorChatbotInput): Promise<AiTutorChatbotOutput> {
  return aiTutorChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTutorChatbotPrompt',
  input: {schema: AiTutorChatbotInputSchema},
  output: {schema: AiTutorChatbotOutputSchema},
  prompt: `You are an AI tutor chatbot that answers questions about course content and provides guidance to learners.

  Here is the course content:
  {{courseContent}}

  Here is the user question:
  {{question}}

  Answer the question based on the course content. Be concise and helpful.
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
