# Checklist de Tests pour FormaAfrique

Ce document fournit une checklist complète pour les tests manuels et une stratégie pour les tests automatisés afin de valider les fonctionnalités de FormaAfrique.

---

## 1. Prérequis : Lancer l'Émulateur Firebase

Avant de lancer les tests (unitaires, intégration, E2E), il est crucial de démarrer l'émulateur Firebase. Cela crée un environnement de développement local complet qui simule les services Firebase (Auth, Firestore, Functions, etc.).

**Commande pour lancer l'émulateur :**
```bash
firebase emulators:start --import=./firebase-export --export-on-exit
```
*   `--import=./firebase-export` : Charge des données de test au démarrage (optionnel).
*   `--export-on-exit` : Sauvegarde les données de l'émulateur à l'arrêt, pour les réutiliser.

---

## 2. Tests Unitaires (Jest + React Testing Library)

**Objectif :** Tester les composants React de manière isolée pour s'assurer qu'ils se rendent correctement en fonction de leurs props et de leur état.

**Installation :**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

**Exemple de test pour `TrainerStats.tsx` (`src/components/TrainerStats.test.tsx`) :**

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import TrainerStats from './TrainerStats'; // Assurez-vous que le chemin est correct

// Mock du hook useUser pour contrôler les données
jest.mock('@/firebase', () => ({
  useUser: () => ({
    user: { uid: 'test-author-id' },
  }),
  db: {} // Mock de la base de données
}));

describe('TrainerStats Component', () => {

  test('affiche un état de chargement initialement', () => {
    // Simuler le chargement en passant une prop `loading`
    render(<TrainerStats courses={[]} loading={true} />);
    
    // Vérifie que les skeletons ou les loaders sont bien présents
    const loaders = screen.getAllByRole('status'); // suposant que vos loaders ont un role="status"
    expect(loaders.length).toBeGreaterThan(0);
    expect(screen.getByText(/Chargement des statistiques.../i)).toBeInTheDocument();
  });

  test('affiche les statistiques une fois les données chargées', () => {
    const mockCourses = [{ id: 'course1', title: 'Cours de Test' }];
    const mockStats = {
      totalCourses: 1,
      totalStudents: 120,
      totalRevenue: 450000,
      totalWatchMinutes: 3000,
    };
    
    // Simuler le rendu avec les données
    render(<TrainerStats courses={mockCourses} stats={mockStats} loading={false} />);

    // Vérifie que les valeurs sont correctement affichées
    expect(screen.getByText('Cours créés')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    expect(screen.getByText('Étudiants inscrits')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    
    expect(screen.getByText(/450 000/)).toBeInTheDocument(); // Utilise une regex pour le formatage
    expect(screen.getByText('50.0 heures')).toBeInTheDocument(); // Vérifie le formatage des heures
  });

   test('affiche un message d\'erreur en cas de problème', () => {
    // Simuler une erreur
    render(<TrainerStats error="Impossible de charger les statistiques." loading={false} />);
    expect(screen.getByText(/Impossible de charger les statistiques/i)).toBeInTheDocument();
  });

});
```

---

## 3. Tests d'Intégration (Jest + Firebase Emulator)

**Objectif :** Tester l'interaction entre vos Cloud Functions et Firestore. On déclenche une fonction et on vérifie que les données dans la base de données (émulée) sont bien mises à jour.

**Exemple de test pour `onVideoViewIncrement` :**

```typescript
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import * as admin from 'firebase-admin';

// Initialisation de l'environnement de test
const testEnv = await initializeTestEnvironment({
  projectId: "formaafrique-test",
  firestore: {
    host: "localhost",
    port: 8080,
  },
});

const db = testEnv.unauthenticatedContext().firestore();

describe('onVideoViewIncrement Cloud Function', () => {

  beforeAll(async () => {
    // Pré-remplir la base de données avec des données de test
    await db.doc('formations/course-1').set({ authorId: 'author-1', totalViews: 0, totalWatchMinutes: 0 });
    await db.doc('formateur_stats/author-1').set({ totalWatchMinutes: 0 });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  test('devrait incrémenter correctement les statistiques de visionnage', async () => {
    // Simuler l'appel à la Cloud Function (on suppose qu'elle est exposée via un endpoint HTTPS)
    const onVideoViewIncrement = require('../src/functions/analytics').onVideoViewIncrement;
    const context = { auth: { uid: 'student-1' } };
    const data = { videoId: 'video-1', courseId: 'course-1', watchMinutes: 1.5 };

    // --- Appel de la fonction ---
    // Dans un vrai test, on utiliserait un client HTTP pour appeler l'URL de l'émulateur
    // Ici, nous appelons la logique directement pour simplifier
    await onVideoViewIncrement(data, context);

    // --- Vérification des résultats dans la DB ---
    const courseDoc = await db.doc('formations/course-1').get();
    const statsDoc = await db.doc('formateur_stats/author-1').get();

    expect(courseDoc.data().totalViews).toBe(1);
    expect(courseDoc.data().totalWatchMinutes).toBe(1.5);
    expect(statsDoc.data().totalWatchMinutes).toBe(1.5);
  });
});
```

---

## 4. Tests End-to-End (E2E) avec Playwright

**Objectif :** Simuler un parcours utilisateur complet dans un vrai navigateur pour valider l'intégration de toutes les parties (UI, Firebase).

**Exemple de fichier de test (`tests/e2e/course-creation.spec.ts`) :**

```typescript
import { test, expect, type Page } from '@playwright/test';

const FORMATEUR_EMAIL = 'formateur@test.com';
const FORMATEUR_PASSWORD = 'password123';
const STUDENT_EMAIL = 'student@test.com';
const STUDENT_PASSWORD = 'password123';

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  // Attendre que la redirection soit terminée
  await page.waitForURL('**/dashboard'); // ou '/formateur'
}

test.describe('Parcours de création et de visionnage de cours', () => {
  let courseTitle: string;

  test.beforeEach(() => {
    courseTitle = `Cours de Test E2E - ${Date.now()}`;
  });

  test('un formateur peut créer un cours et un étudiant peut le visionner', async ({ browser }) => {
    // --- Contexte du Formateur ---
    const formateurContext = await browser.newContext();
    const pageFormateur = await formateurContext.newPage();

    // 1. Connexion du formateur
    await login(pageFormateur, FORMATEUR_EMAIL, FORMATEUR_PASSWORD);
    await pageFormateur.goto('/formateur/courses');

    // 2. Création d'un nouveau cours
    await pageFormateur.click('button:has-text("Créer une formation")');
    await pageFormateur.fill('input[name="title"]', courseTitle);
    await pageFormateur.fill('textarea[name="summary"]', 'Description de test pour Playwright.');
    // ... remplir les autres champs ...
    await pageFormateur.click('button:has-text("Créer et continuer")');

    // 3. Ajouter un module et une vidéo
    await pageFormateur.waitForURL('**/formateur/courses/**/modules');
    // ... ici, scripter l'ajout d'un module et d'une vidéo ...

    // --- Contexte de l'Étudiant ---
    const studentContext = await browser.newContext();
    const pageStudent = await studentContext.newPage();

    // 4. Connexion de l'étudiant
    await login(pageStudent, STUDENT_EMAIL, STUDENT_PASSWORD);
    
    // 5. L'étudiant trouve et regarde le cours
    await pageStudent.goto('/courses');
    await pageStudent.click(`text=${courseTitle}`);
    await pageStudent.waitForURL('**/courses/**');
    
    // Simuler le visionnage de la vidéo...
    // Attendre 30 secondes pour que l'événement `onVideoViewIncrement` soit envoyé
    await pageStudent.waitForTimeout(30000);

    // --- Vérification ---
    // 6. Le formateur vérifie ses statistiques
    await pageFormateur.goto('/formateur');
    await pageFormateur.reload();
    
    // Vérifier que le nombre de vues a bien été incrémenté (exemple)
    const viewsElement = pageFormateur.locator('text=/vues/i').first();
    await expect(viewsElement).toContainText('1');
  });
});
```

---

## 5. Checklist de Pré-production

Avant de déployer l'application pour les utilisateurs finaux, il est impératif de vérifier les points suivants.

| Catégorie | Point de Vérification | Statut | Notes |
| :--- | :--- | :--- | :--- |
| **Configuration** | **Variables d'environnement** : Le fichier `.env.local` ou `.env.production` est correctement configuré avec les clés Firebase de production. | ☐ | Ne jamais commiter les clés de production dans le code source. |
| | **Domaines autorisés** : Le domaine de production a été ajouté aux domaines autorisés dans Firebase Authentication. | ☐ | Essentiel pour que l'authentification Google/Email fonctionne. |
| **Firebase** | **Facturation (Billing)** : Le projet Firebase est lié à un compte de facturation (Plan "Blaze"). | ☐ | Obligatoire pour l'utilisation des Cloud Functions, Cloud Run, et des API Google Cloud (GenAI, Video Intelligence). |
| | **Règles de sécurité** : Les règles de Firestore (`firestore.rules`) et de Storage (`storage.rules`) ont été déployées en production. | ☐ | **CRUCIAL.** Sans cela, votre base de données est vulnérable. |
| | **Index Firestore** : Tous les index composites recommandés ou nécessaires pour les requêtes complexes ont été créés. | ☐ | Sans index, les requêtes complexes échoueront ou seront très lentes. |
| **Déploiement** | **Build de Production** : L'application a été buildée avec `npm run build` sans erreurs. | ☐ | `next build` optimise l'application pour la performance. |
| | **Dépendances** : Toutes les dépendances sont listées dans `package.json` et non dans `devDependencies` si elles sont nécessaires en production. | ☐ | Une erreur courante qui peut casser le build de production. |
| **Monitoring** | **Analytics** : Google Analytics (ou un autre outil) est configuré pour suivre l'utilisation de l'application. | ☐ | Permet de comprendre le comportement des utilisateurs. |
| | **Alertes de budget** : Des alertes de budget ont été configurées sur le compte Google Cloud pour éviter les coûts imprévus. | ☐ | Essentiel lorsque l'on utilise des API payantes comme celles de l'IA. |
| | **Monitoring des erreurs** : Un service de suivi des erreurs (ex: Sentry, LogRocket) ou le système interne (`admin_notifications/errors`) est mis en place pour capturer les erreurs. | ☐ | Permet de réagir rapidement aux bugs rencontrés. |
| **Juridique** | **Politique de confidentialité** : La page `/privacy` est à jour et reflète l'utilisation des données. | ☐ | |
| | **Conditions d'utilisation** : Les conditions d'utilisation sont claires, notamment concernant la propriété du contenu des formateurs. | ☐ | |
