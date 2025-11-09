'use server';
/**
 * @fileOverview A Genkit flow for generating automatic replies in a chat.
 *
 * This flow acts as an AI assistant that can provide helpful, short answers
 * when a human agent is not available.
 * - autoReply: The main function to call the auto-reply flow.
 * - AutoReplyInput: The Zod schema for the input.
 * - AutoReplyResponse: The Zod schema for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the input schema for the auto-reply flow.
export const AutoReplyInputSchema = z.object({
  text: z.string().describe('The user\'s message that needs a reply.'),
  fromUid: z.string().describe('The user ID of the message sender.'),
  chatId: z.string().describe('The ID of the current chat session.'),
  formationId: z.string().describe('The ID of the formation (course/group) the user belongs to.'),
});
export type AutoReplyInput = z.infer<typeof AutoReplyInputSchema>;

// Define the output schema for the auto-reply flow.
export const AutoReplyResponseSchema = z.object({
  reply: z.string().describe('The generated, helpful, and short reply.'),
});
export type AutoReplyResponse = z.infer<typeof AutoReplyResponseSchema>;

/**
 * A Genkit flow that generates an automatic reply to a user's message.
 * @param {AutoReplyInput} input - The user's message and context.
 * @returns {Promise<AutoReplyResponse>} - The generated reply.
 */
export async function autoReply(input: AutoReplyInput): Promise<AutoReplyResponse> {
  return autoReplyFlow(input);
}

const autoReplyPrompt = ai.definePrompt({
  name: 'autoReplyPrompt',
  input: { schema: AutoReplyInputSchema },
  output: { schema: AutoReplyResponseSchema },
  prompt: `You are an AI assistant for FormaAfrique, an educational platform.
    A user has sent a message, but no human agent is available to reply.
    Your task is to provide a short, helpful, and encouraging response in French.

    User's message: "{{text}}"
    Context: The user is in the formation (group) ID: "{{formationId}}".

    Instructions:
    1. Acknowledge the user's message.
    2. Provide a brief, general answer if possible, or suggest where they might find help (e.g., "Consultez la section FAQ" or "Posez votre question dans le forum de la communauté").
    3. Assure them that a human will get back to them soon.
    4. Keep the reply under 50 words.
    
    Your response must be in JSON format.
  `,
});

const autoReplyFlow = ai.defineFlow(
  {
    name: 'autoReplyFlow',
    inputSchema: AutoReplyInputSchema,
    outputSchema: AutoReplyResponseSchema,
  },
  async (input) => {
    const { output } = await autoReplyPrompt(input);
    if (!output) {
      throw new Error('Auto-reply flow failed to produce an output.');
    }
    return output;
  }
);
