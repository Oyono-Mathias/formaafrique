# Guide de l'Administrateur pour la Modération et la Gestion de l'IA sur FormaAfrique

## 1. Introduction

Bienvenue dans le guide de la console de modération et de gestion de l'IA de FormaAfrique. Ce document a pour but de vous aider à comprendre et à utiliser efficacement les outils mis à votre disposition pour garantir un environnement sûr, respectueux et intelligent pour tous nos utilisateurs.

Notre plateforme utilise l'Intelligence Artificielle pour deux tâches principales :
1.  **La Modération des Contenus** : Analyser les messages en temps réel pour détecter les contenus problématiques.
2.  **Le Tutorat Virtuel** : Aider les étudiants en répondant à leurs questions sur les formations.

Votre rôle d'administrateur est crucial pour superviser ces systèmes, traiter les cas complexes, répondre aux contestations et améliorer continuellement la performance de l'IA.

---

## 2. Modération des Contenus

### A. Comprendre les Données de Modération

Deux collections principales dans Firestore sont utilisées pour la modération.

*   **`moderationLogs`** : Cette collection est un journal d'audit. **Chaque message analysé** y laisse une trace. Utile pour des analyses a posteriori.
*   **`aiFlags`** : C'est votre **liste de tâches principale**. Seuls les messages qui nécessitent une attention humaine y sont ajoutés. La page `/admin/moderation` est conçue pour gérer les entrées de cette collection.

### B. Procédure de Traitement des Signalements (`aiFlags`)

Lorsque vous accédez à la page `/admin/moderation`, vous verrez la liste des messages en attente de révision. Pour chaque message :

1.  **Analysez le Contexte** : Lisez le message et, si nécessaire, consultez l'aperçu de la conversation.
2.  **Évaluez la Décision de l'IA** : La raison du signalement est-elle justifiée ?
3.  **Prenez une Décision** :
    *   **Approve** : Si l'IA a fait une erreur (faux positif).
    *   **Remove / Delete** : Si le message est clairement inapproprié.
    *   **Suspend User** : Pour les récidivistes ou les infractions graves.
4.  Mettez à jour le `status` du document dans `aiFlags` à `resolved` ou `dismissed`.

### C. Gestion des Contestations (`moderationAppeals`)

Les utilisateurs peuvent contester une décision via leurs notifications. Ces contestations arrivent dans la collection `moderationAppeals`.

1.  Consultez la collection `moderationAppeals` pour les demandes en `pending`.
2.  Examinez le `flagId` associé pour retrouver le contexte.
3.  Réévaluez et changez le statut de l'appel à `approved` ou `rejected`.

---

## 3. Gestion du Tuteur IA

### A. Boucle de Feedback et Amélioration Continue

La page `/admin/tutor-feedback` affiche les réponses du tuteur que les utilisateurs ont signalées comme incorrectes. Votre rôle est de :

1.  **Analyser les feedbacks négatifs** : Identifiez pourquoi la réponse était mauvaise. Le contexte était-il incorrect ? La réponse était-elle hors sujet ?
2.  **Identifier les tendances** : Si plusieurs feedbacks concernent le même sujet, c'est un signe qu'une partie du contenu de votre cours est peut-être mal indexée ou que le prompt du tuteur a besoin d'être ajusté.
3.  **Utiliser ces exemples** pour affiner le système (voir section "Ajuster l'IA" ci-dessous).

### B. Monitoring et Maintenance (Concepts Clés)

La surveillance de la performance et des coûts est essentielle. Vous devriez mettre en place un tableau de bord (par exemple, sur Google Cloud ou Firebase) pour suivre ces indicateurs :

*   **Nombre de requêtes/jour** : Pour suivre l'utilisation.
*   **Taux d'erreur** : Pourcentage de requêtes qui échouent.
*   **Latence (p95)** : Le temps de réponse pour 95% des requêtes. Une alerte doit être configurée si ce temps dépasse 3 secondes.
*   **Coût estimé des APIs** : Pour maîtriser votre budget.

**Maintenance : Le Re-indexage**

Parfois, il peut être nécessaire de régénérer tous les "embeddings" de votre contenu. C'est ce qu'on appelle un **re-indexage complet**.
*   **Quand ?** Après une mise à jour majeure du modèle d'IA, ou si vous modifiez fondamentalement la structure du texte (via `formatForEmbedding`).
*   **Comment ?** Cela nécessite un script côté serveur qui parcourt toutes vos formations, modules et vidéos, et déclenche la fonction de génération d'embedding pour chacun. Cette opération peut être lancée manuellement par un développeur ou planifiée (ex: chaque semaine).

---

## 4. FAQ et Comment Ajuster l'IA

### Q : Que faire si un message légitime est bloqué par la modération (faux positif) ?

R : C'est un "faux positif". Utilisez l'action "Approve" (ou "Dismiss") sur la page `/admin/moderation` pour le restaurer. Si un certain type de message est systématiquement bloqué à tort, il est temps d'ajuster le prompt de modération.

### Q : Comment ajuster les seuils ou le comportement de l'IA ?

R : Le "réglage fin" se fait principalement en modifiant les **prompts**.

#### **Ajuster le Modérateur de Contenu**

*   **Fichier concerné** : `src/ai/flows/moderate-text-flow.ts`.
*   **Action** : Modifiez la section `MODERATION RULES` dans le `prompt`. Par exemple, si l'IA est trop sensible aux discussions sur les "prix", vous pouvez ajouter une instruction comme : `"Ne pas bloquer les discussions générales sur le prix des cours, uniquement les demandes de paiement direct entre utilisateurs."`.

#### **Ajuster la Personnalité du Tuteur IA**

*   **Fichier concerné** : `src/ai/flows/ai-tutor-chatbot.ts`.
*   **Action** : Modifiez le `prompt` système. Vous pouvez changer son ton, ses instructions, ou la manière dont il doit structurer sa réponse. Par exemple, pour le rendre plus concis, ajoutez : `"Limite tes réponses à 3 phrases maximum."`.

### Q : Comment améliorer la pertinence des réponses du tuteur ?

La pertinence dépend de la qualité des données indexées.

*   **Action** : Mettez à jour les champs `summary` et `keywords` de vos formations (`formations/{formationId}`). Ces champs sont utilisés pour créer les "embeddings". Des mots-clés précis et un bon résumé aident l'IA à mieux comprendre de quoi parle le cours.
*   Après une mise à jour significative de ces champs, un **re-indexage** peut être nécessaire pour que les changements soient pris en compte.

### Q : Comment fonctionne le contrôle de la pertinence (Topicalité) ?

Actuellement, le système utilise deux méthodes :
1.  **Pour la modération** : Le `formationId` est passé à l'IA, qui évalue si le message est lié au sujet général de la formation.
2.  **Pour le tuteur IA** : La recherche est **filtrée** pour ne renvoyer que des résultats (embeddings) appartenant à la `formationId` de l'étudiant. C'est une méthode très efficace pour garantir que les réponses sont contextuelles au cours de l'étudiant.
