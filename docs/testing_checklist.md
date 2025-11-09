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

## 2. Stratégie de Tests Automatisés

### A. Tests Unitaires & d'Intégration (Jest & React Testing Library)

**Objectif :** Tester des composants et des hooks de manière isolée pour garantir leur logique interne.

**Exemples de tests :**

1.  **`FollowButton.test.tsx`**
    *   Le bouton affiche "Suivre" si l'utilisateur ne suit pas la cible.
    *   Le bouton affiche "Suivi" si l'utilisateur suit déjà la cible.
    *   Simuler un clic et vérifier que la fonction Firestore `updateDoc` est appelée avec les bons arguments (`arrayUnion` ou `arrayRemove`).
    *   Le bouton affiche un `Loader` pendant l'opération.

2.  **`FriendRequestButton.test.tsx`**
    *   Tester l'affichage correct pour chaque statut : `not_friends`, `request_sent`, `request_received`, `friends`.
    *   Simuler un clic sur "Ajouter comme ami" et vérifier que `addDoc` et `writeBatch` sont appelés pour créer la demande et la notification.
    *   Simuler un clic sur "Accepter" et vérifier que `updateDoc` est appelé pour mettre à jour les listes d'amis.

3.  **`useUser.test.tsx`**
    *   Tester le hook pour s'assurer qu'il récupère et met à jour correctement le profil utilisateur depuis Firestore lorsque l'état d'authentification change.

### B. Tests de Bout en Bout (End-to-End avec Playwright)

**Objectif :** Simuler des parcours utilisateur complets dans un vrai navigateur pour valider l'intégration de toutes les parties (UI, Firebase).

**Prérequis :**
*   Installer Playwright : `npm install --save-dev @playwright/test`
*   Configurer Playwright pour votre projet : `npx playwright install`

**Exemple de fichier de test (`tests/social.spec.ts`) :**

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
    await pageA.fill('input[name="email"]', USER_A_EMAIL);
    await pageA.fill('input[name="password"]', USER_A_PASSWORD);
    await pageA.click('button[type="submit"]');
    await expect(pageA).toHaveURL('/dashboard');
    
    await pageB.goto('/login');
    await pageB.fill('input[name="email"]', USER_B_EMAIL);
    await pageB.fill('input[name="password"]', USER_B_PASSWORD);
    await pageB.click('button[type="submit"]');
    await expect(pageB).toHaveURL('/dashboard');

    // Étape 2: L'Utilisateur A envoie une demande d'ami à B
    await pageA.goto('/friends'); // Supposons une page pour trouver des utilisateurs
    await pageA.fill('input[placeholder*="Rechercher"]', USER_B_EMAIL);
    await pageA.click(`text=${USER_B_EMAIL}`); // Navigue vers le profil de B
    await pageA.click('button:has-text("Ajouter comme ami")');
    await expect(pageA.locator('button:has-text("Demande envoyée")')).toBeVisible();

    // Étape 3: L'Utilisateur B accepte la demande
    await pageB.goto('/friends');
    await pageB.click('button[role="tab"]:has-text("Demandes")');
    await expect(pageB.locator(`text=${USER_A_EMAIL}`)).toBeVisible();
    await pageB.click('button:has-text("Accepter")');
    await expect(pageB.locator('button:has-text("Amis")')).toBeVisible();

    // Étape 4: L'Utilisateur A vérifie que B est son ami et envoie un message
    await pageA.reload();
    await pageA.goto('/friends');
    await expect(pageA.locator(`text=${USER_B_EMAIL}`)).toBeVisible();
    await pageA.locator(`:text("${USER_B_EMAIL}") >> .. >> button:has-text("Message")`).click();
    await expect(pageA).toHaveURL(/\/messages\/.+/);
    
    const messageToSend = `Bonjour B, c'est un test ! ${Date.now()}`;
    await pageA.fill('input[placeholder*="message"]', messageToSend);
    await pageA.click('button:has-text("Send")'); // ou l'icône
    
    // Étape 5: L'Utilisateur B reçoit le message en temps réel
    const chatUrl = pageA.url();
    await pageB.goto(chatUrl);
    await expect(pageB.locator(`text=${messageToSend}`)).toBeVisible();
  });

});
```

**Commande pour lancer les tests E2E :**
```bash
# Lancer les tests en mode headless (sans interface graphique)
npx playwright test

# Lancer les tests avec l'interface de débogage de Playwright
npx playwright test --ui
```