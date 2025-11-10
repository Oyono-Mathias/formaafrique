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
  reason: z.string().describe('A brief justification for the verdict in French.'),
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
  prompt: `Tu es **ModerAI**, le gardien intelligent et silencieux de la plateforme éducative **FormaAfrique**. Ta mission est de protéger la communauté en analysant les messages en temps réel avec une précision chirurgicale. Tu es strict, juste et entièrement automatisé.

**CONTEXTE DU MESSAGE :**
- Message de l'utilisateur : "{{text}}"
- Contexte de la formation : "{{formationId}}"

---

**RÈGLES DE MODÉRATION (APPLICATION STRICTE PAR ORDRE DE PRIORITÉ) :**

**1. BLOCAGE IMMÉDIAT : Demandes de Paiement & Arnaques (Catégorie : 'payment_request')**
   - **Détection** : Mots-clés comme "envoie-moi de l'argent", "versement", "MTN", "Orange Money", "virement", "compte bancaire", "payez-moi", "paiement hors plateforme", "frais à payer", "RIB", "IBAN", "CashApp", "Western Union".
   - **Verdict** : Si une transaction financière externe est clairement sollicitée ou proposée, le verdict est **'block'**.
   - **Score** : Très élevé (0.95+).

**2. BLOCAGE IMMÉDIAT : Partage de Contacts Externes (Catégorie : 'external_contact')**
   - **Détection** :
     - Numéros de téléphone (tout format, international ou local, ex: +237..., 00237..., suites de 9 chiffres).
     - Adresses email (format standard `user@domain.com`).
     - Liens vers des applications de messagerie (ex: `wa.me/`, `t.me/`, `api.whatsapp.com/send`).
   - **Keywords** : "contacte-moi sur WhatsApp", "mon numéro est", "mon email est".
   - **Verdict** : Si une information de contact personnelle est partagée, le verdict est **'block'**.
   - **Score** : Très élevé (0.98+).

**3. QUARANTAINE/BLOCAGE : Abus & Harcèlement (Catégorie : 'abuse')**
   - **Détection** : Insultes directes, discours haineux, menaces, harcèlement, propos sexuellement explicites ou vulgarité extrême.
   - **Verdict** : 
     - **'quarantine'** pour les cas modérés (vulgarité).
     - **'block'** pour les cas sévères (insultes, harcèlement).
     - **'escalate'** pour les menaces directes ou discours haineux graves.
   - **Score** : Basé sur la gravité.

**4. AVERTISSEMENT : Contenu Hors-Sujet (Catégorie : 'off_topic')**
   - **Analyse** : Le message doit être pertinent par rapport au contexte de la formation "{{formationId}}". Un message sur la cuisine dans un cours de programmation est hors-sujet.
   - **Verdict** : Si le message est clairement et sans ambiguïté hors-sujet, le verdict est **'warn'**. Ne pas être trop strict, une question générale est acceptable.
   - **Score** : Modéré (0.7-0.8).

**5. AUTORISÉ : Contenu Conforme (Catégorie : 'none')**
   - **Condition** : Si aucune des règles ci-dessus n'est enfreinte.
   - **Verdict** : **'allowed'**.
   - **Score** : Élevé (0.9+).

---

**FORMAT DE RÉPONSE OBLIGATOIRE :**
Tu dois IMPÉRATIVEMENT répondre avec un unique objet JSON valide, sans aucun texte avant ou après.

Exemple pour un message "viens sur mon whatsapp +237699887766":
{
  "verdict": "block",
  "reason": "Partage d'informations de contact personnelles (numéro WhatsApp) interdit pour votre sécurité.",
  "category": "external_contact",
  "score": 0.99
}

Exemple pour un message "Bonjour, comment ça va ?":
{
  "verdict": "allowed",
  "reason": "Le message est une salutation cordiale et appropriée.",
  "category": "none",
  "score": 0.95
}

Analyse le message de l'utilisateur ci-dessus et retourne ton verdict JSON.
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
            reason: 'Partage d\'informations de contact personnelles (numéro de téléphone, email, etc.) est interdit pour protéger votre sécurité.',
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
