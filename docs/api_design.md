# Conception de l'API et des Cloud Functions pour le Dashboard Formateur

Ce document détaille l'architecture des endpoints API et des fonctions serverless nécessaires pour le tableau de bord des formateurs sur FormaAfrique.

---

## 1. Gestion des Cours

### **1.1. Créer une nouvelle formation**

-   **Endpoint**: `POST /api/formateur/course/create`
-   **Rôle Requis**: `formateur` (validé)
-   **Description**: Crée une nouvelle formation en tant que brouillon. L'ID de l'auteur est automatiquement ajouté.
-   **Validation d'Input**:
    ```typescript
    z.object({
      title: z.string().min(5),
      summary: z.string().min(20),
      categoryId: z.string(),
      keywords: z.array(z.string()).optional(),
    })
    ```
-   **Réponse (Succès - 201 Created)**: L'objet de la formation nouvellement créée.
-   **Exemple JSON d'Entrée**:
    ```json
    {
      "title": "Introduction à la Finance Islamique",
      "summary": "Découvrez les principes fondamentaux de la finance islamique, de la Mourabaha à la Moucharaka.",
      "categoryId": "Finances & Inclusion économique"
    }
    ```
-   **Exemple JSON de Sortie**:
    ```json
    {
      "id": "newCourseId123",
      "title": "Introduction à la Finance Islamique",
      "summary": "...",
      "authorId": "formateurUID456",
      "statut": "brouillon",
      "published": false,
      "createdAt": "2023-10-27T10:00:00Z"
    }
    ```

### **1.2. Mettre à jour une formation**

-   **Endpoint**: `PUT /api/formateur/course/:id`
-   **Rôle Requis**: Auteur du cours ou `admin`.
-   **Description**: Met à jour les métadonnées d'une formation existante.
-   **Validation d'Input**: Similaire à la création, mais tous les champs sont optionnels.
-   **Réponse (Succès - 200 OK)**: L'objet de la formation mise à jour.
-   **Exemple JSON d'Entrée**:
    ```json
    {
      "summary": "Un résumé plus détaillé sur les principes fondamentaux de la finance islamique."
    }
    ```
-   **Exemple JSON de Sortie**:
    ```json
    {
      "id": "existingCourseId456",
      "title": "Introduction à la Finance Islamique",
      "summary": "Un résumé plus détaillé...",
      "updatedAt": "2023-10-27T11:00:00Z"
    }
    ```

### **1.3. Soumettre une formation pour validation**

-   **Endpoint**: `POST /api/formateur/course/:id/submit`
-   **Rôle Requis**: Auteur du cours.
-   **Description**: Change le statut de la formation de `brouillon` à `en_attente` et crée une notification pour les administrateurs.
-   **Validation d'Input**: Aucune (l'ID du cours est dans l'URL).
-   **Réponse (Succès - 200 OK)**:
    ```json
    {
      "message": "Formation soumise pour validation avec succès.",
      "courseId": "existingCourseId456",
      "newStatus": "en_attente"
    }
    ```

---

## 2. Gestion des Modules et Vidéos

### **2.1. Créer un module**

-   **Endpoint**: `POST /api/formateur/course/:id/module/create`
-   **Rôle Requis**: Auteur du cours ou `admin`.
-   **Description**: Ajoute un nouveau module à une formation.
-   **Validation d'Input**:
    ```typescript
    z.object({
      title: z.string().min(3),
      summary: z.string().min(10),
      order: z.number().int().positive(),
    })
    ```
-   **Réponse (Succès - 201 Created)**: Le nouvel objet module.
-   **Exemple JSON d'Entrée**:
    ```json
    {
      "title": "Les Contrats de Financement",
      "summary": "Analyse des différents types de contrats comme la Mourabaha.",
      "order": 1
    }
    ```

### **2.2. Ajouter une vidéo à un module**

-   **Endpoint**: `POST /api/formateur/course/:id/module/:moduleId/video/create`
-   **Rôle Requis**: Auteur du cours ou `admin`.
-   **Description**: Ajoute une vidéo à un module. Valide l'URL (YouTube/Drive) et déclenche un traitement en arrière-plan si nécessaire.
-   **Validation d'Input**:
    ```typescript
    z.object({
      title: z.string().min(3),
      driveUrl: z.string().url(), // URL YouTube ou Google Drive
      order: z.number().int().positive()
    })
    ```
-   **Réponse (Succès - 202 Accepted)**: Accepte la requête et confirme que le traitement a commencé (surtout pour Google Drive).
-   **Exemple JSON d'Entrée**:
    ```json
    {
      "title": "Introduction à la Mourabaha",
      "driveUrl": "https://www.youtube.com/watch?v=abcdef12345",
      "order": 1
    }
    ```
-   **Exemple JSON de Sortie**:
    ```json
    {
      "message": "Vidéo ajoutée et en cours de traitement.",
      "videoId": "newVideoId789",
      "platform": "youtube"
    }
    ```

---

## 3. Données Analytiques et Statistiques

### **3.1. Récupérer les statistiques globales d'un formateur**

-   **Endpoint**: `GET /api/formateur/stats/{authorId}`
-   **Rôle Requis**: `auteur` du profil ou `admin`.
-   **Description**: Récupère les statistiques agrégées en temps réel depuis le document `formateur_stats/{authorId}` et y ajoute le top 5 des cours les plus populaires.
-   **Réponse (Succès - 200 OK)**: Objet contenant les statistiques et la liste des meilleurs cours.
-   **Gestion des Erreurs**: `401 Unauthorized` si l'utilisateur n'est pas le propriétaire ou admin.
-   **Exemple JSON de Sortie**:
    ```json
    {
      "stats": {
        "totalCourses": 12,
        "totalStudents": 1530,
        "totalRevenue": 458000,
        "totalWatchMinutes": 98700,
        "lastUpdated": "2023-10-27T14:00:00Z"
      },
      "topCourses": [
        { "id": "course1", "title": "Marketing Digital de A à Z", "enrolledCount": 450 },
        { "id": "course2", "title": "Introduction à l'Agro-industrie", "enrolledCount": 320 },
        { "id": "course3", "title": "Devenir Community Manager", "enrolledCount": 280 }
      ]
    }
    ```

### **3.2. Récupérer les données temporelles pour les graphiques**

-   **Endpoint**: `GET /api/formateur/analytics/{authorId}?range=30d`
-   **Rôle Requis**: `auteur` du profil ou `admin`.
-   **Description**: Collecte les données journalières de la collection `analytics/{courseId}/daily_YYYYMMDD` pour tous les cours de l'auteur sur une période donnée (`7d`, `30d`, `90d`).
-   **Réponse (Succès - 200 OK)**: Un tableau de points de données pour construire des graphiques.
-   **Gestion des Erreurs**: `400 Bad Request` si le paramètre `range` est invalide.
-   **Exemple JSON de Sortie**:
    ```json
    {
      "timeSeries": [
        { "date": "2023-10-01", "enrollments": 10, "views": 150, "watchMinutes": 3200, "revenue": 5000 },
        { "date": "2023-10-02", "enrollments": 12, "views": 180, "watchMinutes": 3800, "revenue": 6000 },
        ...
      ]
    }
    ```
    
### **3.3. Enregistrer le temps de visionnage**

-   **Fonction**: `onVideoViewIncrement` (Cloud Function Callable)
-   **Rôle Requis**: Tout utilisateur authentifié.
-   **Description**: Cette fonction est appelée directement par le lecteur vidéo du client. C'est le seul point d'entrée pour incrémenter les statistiques de visionnage, garantissant que les données ne peuvent pas être falsifiées.
-   **Input JSON**:
    ```json
    {
      "videoId": "video123",
      "courseId": "course456",
      "watchMinutes": 1.5
    }
    ```
-   **Réponse (Succès - 200 OK)**:
     ```json
    {
      "success": true,
      "message": "Analytics updated successfully."
    }
    ```
    
### **3.4. Obtenir le classement des étudiants**

-   **Endpoint**: `GET /api/formateur/leaderboard/{authorId}?period=month`
-   **Rôle Requis**: `auteur` du profil ou `admin`.
-   **Description**: Calcule et retourne le classement des étudiants basé sur des métriques comme le temps de visionnage total ou les points d'expérience (XP) gagnés sur une période donnée (`week`, `month`, `all_time`).
-   **Réponse (Succès - 200 OK)**: Liste des meilleurs étudiants.
-   **Exemple JSON de Sortie**:
    ```json
    {
      "leaderboard": [
        { "studentId": "studentUID1", "name": "Fatima Diallo", "xpGained": 520, "avatarUrl": "..." },
        { "studentId": "studentUID2", "name": "Samuel Adebayo", "xpGained": 480, "avatarUrl": "..." },
        { "studentId": "studentUID3", "name": "Chloé Dubois", "xpGained": 450, "avatarUrl": "..." }
      ]
    }
    ```

---

## 4. Traitement Média (Cloud Functions / Cloud Run)

### **4.1. Générer une miniature**

-   **Fonction**: `generateThumbnail` (déclenchée par un événement Storage)
-   **Type**: Cloud Function (Event-driven)
-   **Déclencheur**: `google.storage.object.finalize` sur le bucket des vidéos.
-   **Rôle Requis**: Service Account de la fonction.
-   **Description**: Lorsqu'une nouvelle vidéo est uploadée (copiée depuis Drive), cette fonction utilise un outil comme `ffmpeg` pour extraire une miniature et la sauvegarde dans Storage. Met ensuite à jour le champ `thumbnailUrl` du document vidéo dans Firestore.
-   **Input**: Événement de Cloud Storage.
-   **Réponse**: Aucune (met à jour Firestore directement).

### **4.2. Copier une vidéo depuis Google Drive**

-   **Fonction**: `copyFromDrive` (appelable)
-   **Type**: Cloud Function (HTTPS Callable)
-   **Rôle Requis**: Auteur du cours.
-   **Description**: Appelée par le front-end lorsqu'une URL Google Drive est soumise. Utilise l'API Google Drive (avec OAuth2) pour télécharger la vidéo et la ré-uploader sur Firebase Storage dans un chemin sécurisé.
-   **Input JSON**:
    ```json
    {
      "driveFileId": "driveFileIdAbc",
      "targetPath": "videos/courseId123/video.mp4"
    }
    ```
-   **Réponse JSON**:
    ```json
    {
      "status": "processing",
      "storagePath": "videos/courseId123/video.mp4"
    }
    ```
---

## 5. Gestion Financière et Communautaire

### **5.1. Créer une intention de don**

-   **Endpoint**: `POST /api/donations/create-intent`
-   **Rôle Requis**: `etudiant` (ou tout utilisateur authentifié).
-   **Description**: Crée une transaction `en_attente` dans Firestore et génère une intention de paiement auprès de Stripe ou Paystack.
-   **Input JSON**:
    ```json
    {
      "amount": 5000,
      "currency": "XAF",
      "courseId": "targetCourseId789"
    }
    ```
-   **Réponse JSON**:
    ```json
    {
      "clientSecret": "pi_3L...", // Pour Stripe
      "transactionId": "localDonationIdAbc"
    }
    ```

### **5.2. Modérer un message**

-   **Endpoint**: `POST /api/ai/moderate-message` (Genkit Flow)
-   **Rôle Requis**: Tout utilisateur authentifié (appelé en interne).
-   **Description**: Analyse le texte d'un message (chat 1-on-1 ou groupe) pour détecter du contenu inapproprié.
-   **Input JSON**:
    ```json
    {
      "text": "Contacte-moi sur WhatsApp au +237..."
    }
    ```
-   **Réponse JSON**:
    ```json
    {
      "verdict": "blocked",
      "reason": "Partage de contact externe",
      "category": "external_contact",
      "score": 0.98
    }
    ```

---

## 6. Génération de Documents

### **6.1. Générer un certificat**

-   **Fonction**: `generateCertificate`
-   **Type**: Cloud Function (HTTPS Callable)
-   **Déclencheur**: Appelé par le client lorsqu'un utilisateur qui a terminé un cours clique sur "Voir le certificat".
-   **Rôle Requis**: `etudiant` (propriétaire de la progression).
-   **Description**: Vérifie si la progression du cours est bien à 100%. Utilise une librairie comme `pdf-lib` ou un service tiers pour générer un PDF avec le nom de l'étudiant, le titre du cours, et la date.
-   **Input JSON**:
    ```json
    {
      "courseId": "completedCourseId123"
    }
    ```
-   **Réponse**: Un fichier PDF (`application/pdf`).
```