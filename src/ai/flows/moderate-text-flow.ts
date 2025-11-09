'use server';
/**
 * @fileOverview A Genkit flow for text moderation.
 *
 * This file defines a flow that takes a string of text and uses an AI model
 * to determine if the content is appropriate based on a set of rules.
 * - moderateText: The main function to call the moderation flow.
 * - ModerationInput: The Zod schema for the input.
 * - ModerationResponse: The Zod schema for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the input schema for the moderation flow.
export const ModerationInputSchema = z.object({
  text: z.string().describe('The text content to be moderated.'),
  formationId: z.string().describe('The ID of the formation (course/topic) for context.'),
});
export type ModerationInput = z.infer<typeof ModerationInputSchema>;

// Define the output schema for the moderation flow.
export const ModerationResponseSchema = z.object({
  verdict: z.enum(['allowed', 'warn', 'quarantine', 'block', 'escalate']).describe('The final decision of the moderator based on the severity of the infraction.'),
  reason: z.string().describe('A brief justification for the verdict.'),
  category: z.enum(['none', 'payment_request', 'external_contact', 'off_topic', 'abuse']).describe('The primary category of the detected infraction.'),
  score: z.number().describe('The confidence score (0 to 1) of the verdict.'),
});
export type ModerationResponse = z.infer<typeof ModerationResponseSchema>;

/**
 * A Genkit flow that moderates input text against a set of rules.
 * @param {ModerationInput} input - The text to moderate and its context.
 * @returns {Promise<ModerationResponse>} - The moderation result.
 */
export async function moderateText(input: ModerationInput): Promise<ModerationResponse> {
  return moderateTextFlow(input);
}

const moderationPrompt = ai.definePrompt({
  name: 'textModerationPrompt',
  input: { schema: ModerationInputSchema },
  output: { schema: ModerationResponseSchema },
  prompt: `You are an AI content moderator for FormaAfrique, an educational platform.
    Your task is to analyze the user's message based on a strict set of rules and return a moderation verdict.

    USER MESSAGE: "{{text}}"
    FORMATION CONTEXT: "{{formationId}}"

    MODERATION RULES (in order of priority):

    1.  **Block Payment/Money Transfer Requests (Category: 'payment_request'):**
        - Keywords: "envoie-moi de l'argent", "versement", "MTN", "Orange Money", "virement", "compte bancaire", "payez moi", "paiement hors plateforme", "frais à payer", "RIB", "IBAN".
        - Verdict: 'block' if a clear money request is made.

    2.  **Block External Contact Sharing (Category: 'external_contact'):**
        - Detect phone numbers (patterns like +237, 00237 followed by 9 digits, or sequences of 9+ digits).
        - Detect emails.
        - Detect links to messaging apps (wa.me/, t.me/, api.whatsapp.com/send).
        - Keywords: "contacte-moi sur WhatsApp", "mon numéro est", "mon email est".
        - Verdict: 'block' if personal contact info is shared.

    3.  **Flag Off-Topic Content (Category: 'off_topic'):**
        - The message should be related to the formation context: "{{formationId}}".
        - Example: If formation is 'python', messages about cooking are off-topic.
        - Verdict: 'warn' if the message is completely unrelated to the topic.

    4.  **Detect Abuse/Harassment (Category: 'abuse'):**
        - Look for insults, hate speech, threats, or severe profanity.
        - Verdict: 'quarantine' for moderate cases, 'block' for severe cases, 'escalate' for direct threats.

    5.  **Allowed Content (Category: 'none'):**
        - If none of the above rules are triggered.
        - Verdict: 'allow'.

    RESPONSE FORMAT:
    You MUST respond with a single, valid JSON object matching the output schema.
    - "verdict": One of 'allowed', 'warn', 'quarantine', 'block', 'escalate'.
    - "reason": A short, clear justification for your verdict in French.
    - "category": The primary category that triggered the verdict.
    - "score": Your confidence in this assessment (0.0 to 1.0).

    Example for a message "viens sur mon whatsapp +237699887766":
    {
      "verdict": "block",
      "reason": "Partage d'informations de contact personnelles (numéro WhatsApp).",
      "category": "external_contact",
      "score": 0.98
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
    // For very simple, high-confidence cases, we can use regex before calling the LLM.
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/; // Simple phone regex
    const whatsappRegex = /wa\.me\/|api\.whatsapp\.com/;
    const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

    if (phoneRegex.test(input.text) || whatsappRegex.test(input.text) || emailRegex.test(input.text)) {
        return {
            verdict: 'block',
            reason: 'Partage de contact externe détecté automatiquement.',
            category: 'external_contact',
            score: 1.0
        };
    }

    const { output } = await moderationPrompt(input);
    if (!output) {
      throw new Error('Moderation flow failed to produce an output.');
    }
    return output;
  }
);
