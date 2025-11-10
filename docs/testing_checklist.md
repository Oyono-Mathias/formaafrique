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
| **Restriction de formation**                                                       | 1. A (formation "Python") va sur le profil de C (formation "Comptabilité").<br/>2. A essaie de cliquer sur "Ajouter comme ami".                                                              | Le bouton est désactivé et affiche "Formation différente". L'ajout est impossible.                                       |

### ✅ Messagerie et Chat en Temps Réel

| Scénario de Test                                                                   | Étapes à suivre                                                                                                                                                                             | Résultat Attendu                                                                                                           |
| :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| **Création d'un chat 1-on-1**                                                      | 1. A (qui n'a jamais parlé à B) va sur le profil de B.<br/>2. A clique sur "Message".                                                                                                       | A est redirigé vers `/messages/{chatId}`. Un nouveau chat est créé dans Firestore avec A et B comme membres et le bon `formationId`.|
| **Pas de chat dupliqué**                                                           | 1. B clique à son tour sur "Message" sur le profil de A.                                                                                                                                    | B est redirigé vers le même chat existant (`/messages/{chatId}`). Aucun nouveau chat n'est créé.                           |
| **Envoi/Réception de messages**                                                    | 1. A ouvre le chat avec B et envoie "Bonjour B".<br/>2. B (avec le chat ouvert) voit le message apparaître instantanément.                                                                     | Le message s'affiche en temps réel sans recharger la page.                                                                 |
| **Notifications et Badge "Non lu"**                                                | 1. B ferme la page.<br/>2. A envoie un nouveau message "Comment vas-tu ?".                                                                                                                   | Le badge de notification de B (cloche) s'incrémente. Dans la liste des chats, la conversation avec A est en gras et affiche "1". |
| **Marquer comme lu**                                                               | 1. B ouvre la conversation avec A.                                                                                                                                                          | Le badge "Non lu" disparaît de la conversation. Le compteur dans `chats.unreadCounts` pour B est remis à 0.               |
| **Envoi d'images**                                                                 | 1. A clique sur l'icône trombone, sélectionne une image et envoie.<br/>2. B (avec le chat ouvert) voit l'image apparaître.                                                                     | L'image s'affiche dans le chat pour les deux utilisateurs. Elle est stockée dans Firebase Storage.                          |
| **Sécurité du stockage**                                                           | Essayez d'accéder directement à l'URL de l'image stockée dans Firebase Storage sans être connecté ou en étant un autre utilisateur (Utilisateur C).                                            | L'accès est refusé. Seuls les membres du chat (A et B) peuvent voir l'image.                                               |

### ✅ Modération Automatique

| Scénario de Test                                     | Étapes à suivre                                                                                                                                            | Résultat Attendu                                                                                                                                  |
| :--------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Blocage de numéro de téléphone**                   | 1. A envoie à B un message contenant "Mon numéro est 699887766".                                                                                           | Le message est bloqué. A reçoit une notification de modération. Une alerte est envoyée à l'admin. Le message n'apparaît pas pour B.          |
| **Avertissement pour contenu hors-sujet**            | 1. Dans le chat de la formation "Python", A envoie "Qui vend des chaussures ici ?".                                                                         | Le message est autorisé mais A reçoit une notification d'avertissement. Le message est visible mais marqué pour révision par un admin.     |
| **Contester une décision de modération**             | 1. A, dont le message a été bloqué, va dans ses notifications.<br/>2. A clique sur "Demander une révision".                                                  | Une demande est créée dans la collection `moderationAppeals`. L'admin peut la traiter. A reçoit une confirmation que sa demande est envoyée. |

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
| **Test de Connaissance Générale**                      | 1. Demandez "Combien de formations sont disponibles sur la plateforme ?".                                                                                                                                                                                                 | L'IA doit utiliser son outil `getPublishedCoursesCount` et répondre avec le nombre correct de cours publiés, au lieu de dire qu'elle ne sait pas.                                                                                                                    |
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


---

## 4. Checklist de Pré-production

Avant de déployer l'application pour les utilisateurs finaux, il est impératif de vérifier les points suivants.

| Catégorie         | Point de Vérification                                                                            | Statut | Notes                                                                                                        |
| :---------------- | :----------------------------------------------------------------------------------------------- | :----- | :----------------------------------------------------------------------------------------------------------- |
| **Configuration** | **Variables d'environnement** : Le fichier `.env.local` ou `.env.production` est correctement configuré avec les clés Firebase de production. | ☐      | Ne jamais commiter les clés de production dans le code source.                                                 |
|                   | **Domaines autorisés** : Le domaine de production a été ajouté aux domaines autorisés dans Firebase Authentication. | ☐      | Essentiel pour que l'authentification Google/Email fonctionne.                                               |
| **Firebase**      | **Facturation (Billing)** : Le projet Firebase est lié à un compte de facturation (Plan "Blaze"). | ☐      | Obligatoire pour l'utilisation des Cloud Functions, Cloud Run, et des API Google Cloud (GenAI, Video Intelligence). |
|                   | **Règles de sécurité** : Les règles de Firestore (`firestore.rules`) et de Storage (`storage.rules`) ont été déployées en production. | ☐      | **CRUCIAL.** Sans cela, votre base de données est vulnérable.                                                  |
|                   | **Index Firestore** : Tous les index composites recommandés ou nécessaires pour les requêtes complexes ont été créés. | ☐      | Sans index, les requêtes complexes échoueront ou seront très lentes.                                         |
| **Déploiement**   | **Build de Production** : L'application a été buildée avec `npm run build` sans erreurs.             | ☐      | `next build` optimise l'application pour la performance.                                                         |
|                   | **Dépendances** : Toutes les dépendances sont listées dans `package.json` et non dans `devDependencies` si elles sont nécessaires en production. | ☐      | Une erreur courante qui peut casser le build de production.                                                  |
| **Monitoring**    | **Analytics** : Google Analytics (ou un autre outil) est configuré pour suivre l'utilisation de l'application. | ☐      | Permet de comprendre le comportement des utilisateurs.                                                       |
|                   | **Alertes de budget** : Des alertes de budget ont été configurées sur le compte Google Cloud pour éviter les coûts imprévus. | ☐      | Essentiel lorsque l'on utilise des API payantes comme celles de l'IA.                                        |
|                   | **Monitoring des erreurs** : Un service de suivi des erreurs (ex: Sentry, LogRocket) est mis en place pour capturer les erreurs client. | ☐      | Permet de réagir rapidement aux bugs rencontrés par les utilisateurs.                                        |
| **Juridique**     | **Politique de confidentialité** : La page `/privacy` est à jour et reflète l'utilisation des données, notamment par l'IA de modération. | ☐      |                                                                                                              |
|                   | **Conditions d'utilisation** : Les conditions d'utilisation sont claires, notamment concernant la propriété du contenu des formateurs. | ☐      |                                                                                                              |
