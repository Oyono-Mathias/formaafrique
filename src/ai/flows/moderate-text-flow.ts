'use server';
/**
 * @fileOverview A Genkit flow for text moderation.
 *
 * This file defines a flow that takes a string of text and uses an AI model
 * to determine if the content is appropriate.
 * - moderateText: The main function to call the moderation flow.
 * - ModerationInput: The Zod schema for the input.
 * - ModerationResponse: The Zod schema for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the input schema for the moderation flow.
export const ModerationInputSchema = z.object({
  text: z.string().describe('The text content to be moderated.'),
});
export type ModerationInput = z.infer<typeof ModerationInputSchema>;

// Define the output schema for the moderation flow.
export const ModerationResponseSchema = z.object({
  verdict: z.enum(['allowed', 'blocked', 'review']).describe('The final decision of the moderator.'),
  categories: z.record(z.number()).describe('A dictionary of moderation categories and their confidence scores.'),
  score: z.number().describe('The overall confidence score of the verdict.'),
  action: z.enum(['none', 'flag', 'block_and_flag']).describe('The recommended action to take.'),
});
export type ModerationResponse = z.infer<typeof ModerationResponseSchema>;

/**
 * A Genkit flow that moderates input text.
 * @param {ModerationInput} input - The text to moderate.
 * @returns {Promise<ModerationResponse>} - The moderation result.
 */
export async function moderateText(input: ModerationInput): Promise<ModerationResponse> {
  return moderateTextFlow(input);
}

const moderationPrompt = ai.definePrompt({
  name: 'moderateTextPrompt',
  input: { schema: ModerationInputSchema },
  output: { schema: ModerationResponseSchema },
  prompt: `You are a content moderator for an educational platform.
    Analyze the following text and provide a moderation verdict.
    Your response must be in JSON format.

    Text to analyze: "{{text}}"

    Your task is to determine if the text is 'allowed', 'blocked', or needs human 'review'.
    Also, provide confidence scores for categories like 'toxicity', 'insult', 'spam', 'hate_speech'.
    The 'score' should be your overall confidence in the 'verdict'.
    The 'action' should be 'none' if allowed, 'flag' if review is needed, and 'block_and_flag' if blocked.

    Example response:
    {
      "verdict": "allowed",
      "categories": { "toxicity": 0.1, "insult": 0.05 },
      "score": 0.95,
      "action": "none"
    }
  `,
});

const moderateTextFlow = ai.defineFlow(
  {
    name: 'moderateTextFlow',
    inputSchema: ModerationInputSchema,
    outputSchema: ModerationResponseSchema,
  },
  async (input) => {
    const { output } = await moderationPrompt(input);
    if (!output) {
      throw new Error('Moderation flow failed to produce an output.');
    }
    return output;
  }
);
