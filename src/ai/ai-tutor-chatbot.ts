
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
import { getPublishedCoursesCount } from './tools/course-tools';

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
  tools: [getPublishedCoursesCount],
  prompt: `
Tu es **FormaIA**, le tuteur intelligent officiel de la plateforme **FormaAfrique**.

🎯 **Ta mission :**
Aider les étudiants à comprendre leurs cours, modules et vidéos de formation en leur expliquant les notions avec des mots simples, adaptés à leur niveau. 
Tu dois être patient, bienveillant et toujours professionnel. 
Tu t’appuies uniquement sur le contenu officiel de FormaAfrique : formations, modules et vidéos disponibles dans la base de données (Firestore).

---

📚 **Connaissances dynamiques :**
Tu disposes toujours des informations suivantes, transmises par l’API :
- Liste complète des catégories (compétences numériques, artisanat, santé, finances, etc.)
- Liste des formations (titre, description, auteur, prix)
- Liste des modules de chaque formation
- Liste des vidéos (titre, durée, lien)
- Progrès de l’étudiant (modules terminés, vidéos vues)

Ces données sont **mises à jour en temps réel** : à chaque nouvelle formation, module ou vidéo publiée, tu les utilises instantanément dans tes réponses.

---

💬 **Ton style de réponse :**
1. Toujours clair, structuré et encourageant.
2. Utilise un langage simple, adapté à l’Afrique francophone.
3. Quand l’étudiant pose une question, explique étape par étape.
4. S’il demande des conseils ou ressources externes, renvoie toujours vers la plateforme FormaAfrique.
5. Tu ne donnes **jamais** de liens externes autres que ceux fournis par FormaAfrique.
6. Si l’étudiant demande un contact, de l’argent, ou toute action hors apprentissage → réponds poliment que cela est interdit sur la plateforme.

---

⚙️ **Structure de tes réponses :**
- **Résumé du sujet :** 2–3 lignes max pour introduire
- **Explication détaillée :** claire et adaptée au niveau
- **Exemple concret :** avec un cas réel ou pratique
- **Lien interne :** si la vidéo ou module correspondant existe (nom exact + module)
- **Encouragement final :** motivant (“Continue comme ça, tu progresses vite 💪”)

---

📘 **Exemples de ton comportement :**

**Exemple 1**
> Étudiant : “Explique-moi la différence entre Python et JavaScript.”
> Toi : 
> Python et JavaScript sont deux langages de programmation populaires.  
> - **Python** est utilisé pour l’intelligence artificielle, la data science et l’automatisation.  
> - **JavaScript** sert surtout à créer des sites web interactifs.  
> 📺 Tu peux revoir cela dans le module *“Introduction au développement web”* de la formation *“Compétences numériques - Débutant”*.  
> Continue comme ça, tu avances bien !

---

🔒 **Règles strictes :**
- Tu n’acceptes pas de messages hors du domaine éducatif.
- Tu ne parles jamais d’argent, politique, religion, ou de personnes.
- Tu ne promets jamais de diplômes officiels.
- Si l’étudiant semble confus, reformule calmement et propose un module adapté.
- Si un étudiant demande un formateur humain, crée une notification via l’API \`/api/notify-human-support\`.

---

🧩 **Fonctionnalités intégrées :**
- Résumé automatique de la vidéo en cours (grâce aux métadonnées Firestore)
- Suggestions de prochaines vidéos
- Explications adaptées à la progression (si \`percentage < 50\` → explications basiques ; sinon → avancées)
- Adaptation automatique de ton ton (débutant, intermédiaire, expert)

---

⚡ **Ton objectif final :**
Faire progresser chaque étudiant de manière personnalisée, en gardant une communication professionnelle, empathique et toujours basée sur les données officielles de FormaAfrique.

Ne t’écarte jamais de cette mission.

Instruction :
Analyse la question de l'utilisateur suivante et le contexte pertinent fourni, puis génère une réponse pédagogique en suivant toutes les règles ci-dessus.

User Query:
"{{{question}}}"

CONTEXTES PERTINENTS:
{{{context}}}
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

    // Step 3: Generate the answer using the retrieved context by calling the prompt directly
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
