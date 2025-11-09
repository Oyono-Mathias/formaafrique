# Guide de l'Administrateur pour la Modération sur FormaAfrique

## 1. Introduction

Bienvenue dans le guide de la console de modération de FormaAfrique. Ce document a pour but de vous aider à comprendre et à utiliser efficacement les outils mis à votre disposition pour garantir un environnement sûr, respectueux et constructif pour tous nos utilisateurs.

Notre système de modération repose sur une IA qui analyse les messages en temps réel pour détecter les contenus potentiellement problématiques. Cependant, l'IA n'est pas parfaite. Votre rôle d'administrateur est crucial pour superviser le système, traiter les cas complexes et répondre aux contestations des utilisateurs.

## 2. Comprendre les Données de Modération

Deux collections principales dans Firestore sont utilisées pour la modération. Vous pouvez les explorer via la console Firebase.

### A. `moderationLogs`

Cette collection est un journal d'audit. **Chaque message analysé** (même ceux autorisés) y laisse une trace.

*   **Objectif** : Traçabilité et analyse des performances de l'IA.
*   **Contenu** :
    *   `chatId`, `fromUid`, `text` : Contexte du message.
    *   `verdict` : La décision de l'IA (`allowed`, `warn`, `block`, etc.).
    *   `category` : La catégorie principale de l'infraction détectée (`payment_request`, `abuse`, etc.).
    *   `score` : Le score de confiance de l'IA (entre 0 et 1).
    *   `timestamp` : Date de l'analyse.

> **Quand l'utiliser ?** Principalement pour des analyses a posteriori ou des enquêtes sur des incidents spécifiques. Vous n'interagirez pas quotidiennement avec cette collection.

### B. `aiFlags`

C'est votre **liste de tâches principale**. Seuls les messages qui nécessitent une attention humaine y sont ajoutés.

*   **Objectif** : Gérer les contenus bloqués ou mis en quarantaine par l'IA.
*   **Contenu** :
    *   `chatId`, `fromUid` : Contexte du message.
    *   `reason` : La raison principale du signalement (ex: `external_contact`).
    *   `severity` : `low`, `medium`, ou `high`.
    *   `status` : `pending_review` (par défaut), `resolved`, `dismissed`.
    *   `timestamp` : Date du signalement.

> **Quand l'utiliser ?** C'est ici que vous passerez le plus de temps. La page `/admin/moderation` est conçue pour afficher et vous permettre de gérer les entrées de cette collection.

## 3. Procédure de Traitement des Signalements (`aiFlags`)

Lorsque vous accédez à la page `/admin/moderation`, vous verrez la liste des messages en attente de révision. Pour chaque message :

1.  **Analysez le Contexte** : Lisez le message, identifiez l'auteur et, si nécessaire, consultez l'aperçu de la conversation pour comprendre le contexte.
2.  **Évaluez la Décision de l'IA** : La raison du signalement est-elle justifiée ?
    *   Est-ce une tentative claire de fraude ou de partage de contact ?
    *   L'insulte est-elle caractérisée ?
    *   Le message est-il vraiment hors-sujet ?
3.  **Prenez une Décision** : Utilisez les actions disponibles.
    *   **Approve** : Si l'IA a fait une erreur (faux positif). Le message sera rendu visible et la notification de l'utilisateur sera annulée.
    *   **Remove / Delete** : Si le message est clairement inapproprié et doit être supprimé définitivement.
    *   **Suspend User** : Pour les récidivistes ou les infractions graves. Mettez à jour le statut de l'utilisateur dans `users/{uid}` à `suspendu` et spécifiez une durée si possible.
    *   **Contact User** : Pour envoyer un message privé explicatif à l'utilisateur.

Après chaque action, mettez à jour le `status` du document dans `aiFlags` à `resolved` (si une action a été prise) ou `dismissed` (si le signalement était une erreur).

## 4. Gestion des Contestations (`moderationAppeals`)

Les utilisateurs peuvent contester une décision de modération via leurs notifications. Ces contestations arrivent dans la collection `moderationAppeals`.

*   **Contenu** : `userId`, `flagId` (le document `aiFlags` contesté), `reason`, `status` (`pending`, `approved`, `rejected`).

**Workflow de traitement :**

1.  **Consultez la collection `moderationAppeals`** pour les demandes avec le statut `pending`.
2.  **Examinez le `flagId` associé** pour retrouver le message et le contexte d'origine.
3.  **Réévaluez la situation** : L'utilisateur a-t-il raison ? Le contexte change-t-il la nature du message ?
4.  **Prenez une décision** :
    *   Si vous **approuvez** la contestation : changez le statut de l'appel à `approved`, restaurez le message si nécessaire, et annulez toute sanction.
    *   Si vous **rejetez** la contestation : changez le statut à `rejected` et, si possible, envoyez un message à l'utilisateur pour lui expliquer pourquoi.

## 5. FAQ : Gestion des Faux Positifs

**Q : Que faire si un message parfaitement légitime est bloqué ?**
R : C'est un "faux positif". Utilisez l'action "Approve" pour le restaurer. Si vous remarquez qu'un certain type de message est systématiquement bloqué à tort, il est temps d'ajuster le système.

**Q : Comment puis-je "ajuster" les seuils de l'IA ?**
R : Le "réglage fin" (tuning) se fait principalement en modifiant le prompt de l'IA.
*   **Fichier concerné** : `src/ai/flows/moderate-text-flow.ts`.
*   **Action** : Modifiez le `prompt` envoyé à l'IA. Par exemple, si l'IA est trop sensible aux discussions sur les "prix", vous pouvez ajouter une instruction comme : `"Ne pas bloquer les discussions générales sur le prix des cours, uniquement les demandes de paiement direct entre utilisateurs."`.
*   Chaque modification du prompt nécessite une nouvelle phase de test pour s'assurer qu'elle n'a pas d'effets de bord indésirables.

## 6. Guide sur le Contrôle de Topicalité

Actuellement, le contrôle de la pertinence des messages se fait via le prompt de modération.

*   **Comment ça marche ?** : L'IA reçoit l'`ID de la formation` (`formationId`) en même temps que le texte du message. Le prompt lui demande d'évaluer si le message est lié au sujet de la formation.
*   **Limites** : Cette méthode est efficace mais dépend de la connaissance générale de l'IA sur le sujet. Elle n'est pas basée sur le contenu exact de *vos* cours.
*   **Comment améliorer ?** : Une version future pourrait implémenter un système d'**embeddings**.
    1.  Pour chaque formation, un "embedding" (une représentation numérique du contenu) serait généré à partir de son syllabus et de ses descriptions.
    2.  Lors de la modération, l'embedding du message de l'utilisateur serait comparé à celui de la formation.
    3.  Un score de similarité faible indiquerait un message hors-sujet.
    *Cette fonctionnalité nécessite une infrastructure dédiée et n'est pas encore implémentée.*

Pour l'instant, si vous constatez des erreurs de classification de topicalité, le meilleur moyen de les corriger est d'affiner le prompt dans `moderate-text-flow.ts`.
