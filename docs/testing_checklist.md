# Checklist de Tests pour les Fonctionnalités Sociales et de Messagerie

Ce document fournit une checklist complète pour les tests manuels et une stratégie pour les tests automatisés afin de valider les fonctionnalités sociales et de messagerie de FormaAfrique.

---

## 1. Checklist de Tests Manuels

**Scénario de base :** Utilisez deux navigateurs/profils différents (ou un navigateur normal et un en mode navigation privée) pour simuler l'interaction entre deux utilisateurs (Utilisateur A et Utilisateur B).

### ✅ Gestion des Amis et des Relations

| Scénario de Test                                                                   | Étapes à suivre                                                                                                                                                                             | Résultat Attendu                                                                                                           |
| :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| **Envoyer une demande d'ami**                                                      | 1. A se connecte.<br/>2. A va sur le profil de B.<br/>3. A clique sur "Ajouter comme ami".                                                                                              | Le bouton de A affiche "Demande envoyée". B reçoit une notification.                                                       |
| **Annuler une demande envoyée**                                                    | 1. A se connecte.<br/>2. A retourne sur le profil de B.<br/>3. A clique sur "Demande envoyée".                                                                                              | Le bouton de A redevient "Ajouter comme ami". La notification de B disparaît.                                           |
| **Accepter une demande d'ami**                                                     | 1. B se connecte.<br/>2. B va sur la page `/friends` -> onglet "Demandes".<br/>3. B clique sur "Accepter" sur la demande de A.                                                            | A et B apparaissent dans leurs listes d'amis respectives. Le bouton sur les profils mutuels affiche "Amis".            |
| **Vérifier l'unicité**                                                             | Une fois amis, A ne peut plus envoyer de demande à B.                                                                                                                                       | Les boutons "Ajouter" ne sont plus disponibles entre A et B.                                                               |
| **Suivre / Ne plus suivre un utilisateur**                                           | 1. A va sur le profil de B et clique sur "Suivre".<br/>2. Le bouton devient "Suivi".<br/>3. A clique à nouveau sur "Suivi".                                                                 | Le bouton redevient "Suivre". Les listes `following` de A et `followers` de B sont mises à jour correctement à chaque étape. |

### ✅ Messagerie et Chat en Temps Réel

| Scénario de Test                                                                   | Étapes à suivre                                                                                                                                                                             | Résultat Attendu                                                                                                           |
| :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| **Création d'un chat 1-on-1**                                                      | 1. A (qui n'a jamais parlé à B) va sur le profil de B.<br/>2. A clique sur "Message".                                                                                                       | A est redirigé vers `/messages/{chatId}`. Un nouveau chat est créé dans Firestore avec A et B comme membres.              |
| **Pas de chat dupliqué**                                                           | 1. B clique à son tour sur "Message" sur le profil de A.                                                                                                                                    | B est redirigé vers le même chat existant (`/messages/{chatId}`). Aucun nouveau chat n'est créé.                           |
| **Envoi/Réception de messages**                                                    | 1. A ouvre le chat avec B et envoie "Bonjour B".<br/>2. B (avec le chat ouvert) voit le message apparaître instantanément.                                                                     | Le message s'affiche en temps réel sans recharger la page.                                                                 |
| **Notifications et Badge "Non lu"**                                                | 1. B ferme la page.<br/>2. A envoie un nouveau message "Comment vas-tu ?".                                                                                                                   | Le badge de notification de B (cloche) s'incrémente. Dans la liste des chats, la conversation avec A est en gras et affiche "1". |
| **Marquer comme lu**                                                               | 1. B ouvre la conversation avec A.                                                                                                                                                          | Le badge "Non lu" disparaît de la conversation. Le compteur dans `chats.unreadCounts` pour B est remis à 0.               |
| **Envoi d'images**                                                                 | 1. A clique sur l'icône trombone, sélectionne une image et envoie.<br/>2. B (avec le chat ouvert) voit l'image apparaître.                                                                     | L'image s'affiche dans le chat pour les deux utilisateurs. Elle est stockée dans Firebase Storage.                          |
| **Sécurité du stockage**                                                           | Essayez d'accéder directement à l'URL de l'image stockée dans Firebase Storage sans être connecté ou en étant un autre utilisateur (Utilisateur C).                                            | L'accès est refusé. Seuls les membres du chat (A et B) peuvent voir l'image.                                               |

### ✅ Système de Présence

| Scénario de Test                                                                   | Étapes à suivre                                                                                                                                                                             | Résultat Attendu                                                                                                           |
| :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| **Statut "En ligne"**                                                              | 1. A se connecte.<br/>2. B va sur le profil de A ou dans la liste d'amis.                                                                                                                 | Un point vert apparaît à côté du nom de A. `users/{uid_A}.online` est `true`.                                              |
| **Statut "Hors ligne"**                                                            | 1. A se déconnecte proprement.<br/>2. B observe le statut de A.                                                                                                                             | Le point vert devient gris. `users/{uid_A}.online` est `false` et `lastSeen` est mis à jour.                               |
| **Fermeture d'onglet**                                                             | 1. A est connecté. B voit A en ligne.<br/>2. A ferme l'onglet ou le navigateur.<br/>3. B attend quelques instants.                                                                              | Le statut de A passe à "hors ligne" après un court délai.                                                                  |

### ✅ Tests sur Mobile

Répétez les scénarios ci-dessus sur un appareil mobile ou en utilisant les outils de développement de votre navigateur.

| Scénario de Test                                                                   | Points spécifiques à vérifier                                                                                                                                                           |
| :--------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Affichage Responsive**                                                           | La page `/friends` et la page `/messages` s'affichent-elles correctement ? Les colonnes s'empilent-elles de manière logique ? Les boutons sont-ils accessibles ?                             |
| **Envoi de message et pièce jointe**                                               | Le clavier mobile n'obstrue-t-il pas le champ de saisie ? La sélection de fichiers pour les images fonctionne-t-elle correctement ?                                                            |
| **Performance**                                                                    | L'application reste-t-elle fluide, en particulier le défilement des messages et le changement de conversation ?                                                                           |

---

## 2. Stratégie de Tests Automatisés (E2E)

**Objectif :** Simuler des parcours utilisateur complets dans un vrai navigateur pour valider l'intégration de toutes les parties (UI, Firebase).

**Exemple de fichier de test (`tests/social.spec.ts` avec Playwright) :**

```typescript
import { test, expect } from '@playwright/test';

const USER_A_EMAIL = 'test-user-a@example.com';
const USER_A_PASSWORD = 'password123';
const USER_B_EMAIL = 'test-user-b@example.com';
const USER_B_PASSWORD = 'password123';

test.describe('Social Features', () => {

  test('full friend request and chat flow', async ({ browser }) => {
    // Contexte pour l'Utilisateur A
    const userAContext = await browser.newContext();
    const pageA = await userAContext.newPage();

    // Contexte pour l'Utilisateur B
    const userBContext = await browser.newContext();
    const pageB = await userBContext.newPage();
    
    // Étape 1: Les deux utilisateurs se connectent
    await pageA.goto('/login');
    // ...
    await pageB.goto('/login');
    // ...

    // Étape 2: L'Utilisateur A envoie une demande d'ami à B
    // ...
    
    // Étape 3: L'Utilisateur B accepte la demande
    // ...

    // Étape 4: L'Utilisateur A envoie un message à B
    // ...
    
    // Étape 5: L'Utilisateur B reçoit le message
    // ...
  });
});
```

---

## 3. Tests du Tuteur IA et de la Recherche Sémantique

**Objectif :** Valider que le tuteur IA fournit des réponses pertinentes, sécurisées et basées sur le contenu le plus à jour.

### ✅ Checklist de Tests Manuels

| Scénario de Test                                       | Étapes à suivre                                                                                                                                                                                                                                                          | Résultat Attendu                                                                                                                                                                                                                                                          |
| :----------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pertinence de la Réponse**                           | 1. Connectez-vous en tant qu'étudiant.<br/>2. Allez sur la page `/chatbot`.<br/>3. Posez une question très spécifique sur une vidéo ou un module (ex: "Comment on calcule le fonds de roulement dans le cours de comptabilité ?").<br/>4. Posez une question plus générale sur une formation. | La réponse doit être directement liée à la question. Le premier lien source proposé doit être le bon module/vidéo dans au moins 80% des cas. La réponse doit être pédagogique et proposer un CTA pertinent.                                                  |
| **Test de Contenu Inconnu**                            | 1. Posez une question sur un sujet complètement absent de vos formations (ex: "Quelle est la meilleure recette de couscous ?").                                                                                                                                             | L'IA doit répondre poliment qu'elle n'a pas trouvé d'information à ce sujet dans les cours disponibles, sans inventer de réponse.                                                                                                                                   |
| **Test de Synchronisation (Nouvelle Vidéo)**           | 1. **(Admin)** Allez sur la page de gestion d'une formation et ajoutez une nouvelle vidéo avec un titre très distinctif (ex: "La Formule Secrète de la Photosynthèse Inversée").<br/>2. Attendez **2 minutes**.<br/>3. **(Étudiant)** Posez une question sur "la photosynthèse inversée". | L'IA doit trouver la nouvelle vidéo et baser sa réponse dessus. La nouvelle vidéo doit apparaître dans les sources proposées. Cela valide que le trigger de génération d'embedding fonctionne.                                                                       |
| **Test de Sécurité (Isolation des Formations)**        | 1. Créez deux étudiants : Étudiant A (formation "Python") et Étudiant B (formation "Comptabilité").<br/>2. **(Étudiant A)** Posez une question sur la comptabilité.<br/>3. **(Étudiant B)** Posez une question sur Python.                                                         | Dans les deux cas, l'IA doit répondre qu'elle n'a pas d'information sur le sujet, car la recherche doit être limitée à la formation de l'utilisateur. Aucune fuite d'information entre les formations ne doit se produire.                                          |
| **Feedback Utilisateur**                              | 1. Posez une question et obtenez une réponse.<br/>2. Cliquez sur le bouton "Signaler une réponse incorrecte" (icône pouce vers le bas).<br/>3. **(Admin)** Allez sur la page `/admin/tutor-feedback`.                                                                           | Une nouvelle entrée doit apparaître dans la liste des feedbacks, contenant votre question et la réponse de l'IA.                                                                                                                                           |

### ✅ Tests Automatisés (Exemples de requêtes `cURL`)

Ces exemples supposent que vos Cloud Functions sont déployées et accessibles via une URL. Remplacez `YOUR_FUNCTION_URL` et les `placeholders`.

**1. Tester `vectorSearch`**

```bash
# Test de recherche simple
curl -X POST "https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/vectorSearch" \
-H "Content-Type: application/json" \
-d '{
  "query": "Qu\'est-ce qu\'un bilan comptable ?",
  "topK": 3
}'

# Test de recherche filtrée par formation
curl -X POST "https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/vectorSearch" \
-H "Content-Type: application/json" \
-d '{
  "query": "les bases de python",
  "topK": 3,
  "formationId": "id_de_la_formation_python"
}'
```
**Résultat Attendu :** Un JSON contenant un tableau `results` avec les documents les plus pertinents, incluant `id`, `type`, `score`, et `meta`.

**2. Tester `tutorAnswer` (le flow complet)**

```bash
# Test d'une question d'un utilisateur
curl -X POST "https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/tutorAnswer" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_USER_ID_TOKEN" \ # Sécurité importante
-d '{
  "userId": "id_de_l_utilisateur_test",
  "query": "Comment je crée une fonction en Python ?",
  "formationId": "id_de_la_formation_python"
}'
```
**Résultat Attendu :** Un JSON contenant `answer` (la réponse textuelle de l'IA) et `sources` (les documents utilisés pour générer la réponse).

### ✅ Mesures et Rapports

*   **Latence :** Utilisez des outils comme Postman ou des scripts de test pour mesurer le temps de réponse moyen de votre endpoint `tutorAnswer`. Un objectif raisonnable serait de rester sous les 3-5 secondes.
*   **Taux de Faux Positifs :** Après une semaine d'utilisation, analysez la collection `tutorFeedback`. Le nombre de feedbacks négatifs divisé par le nombre total de requêtes vous donnera un score de satisfaction à améliorer.
*   **Logs d'Erreur :** Surveillez les logs de vos Cloud Functions dans la console Firebase/Google Cloud pour détecter les erreurs inattendues (ex: échec d'appel à l'API d'embedding, timeouts, etc.).
