
# 🚀 Ndara Afrique v2.5 - L'Excellence Panafricaine

Bienvenue sur la version **Elite** de **Ndara Afrique**, l'infrastructure du savoir conçue pour le futur du continent. Cette application combine une esthétique **Fintech Vintage** avec une puissance technologique **Real-Time** et une intelligence **Mathias IA**.

## ✨ Architecture du Système

### 🛡️ Cockpit CEO & Administration (V2.5)
- **Reporting Prédictif** : Radar de croissance IA et widgets financiers de luxe (CA Brut, Net, Volume Bourse).
- **Monitoring Cyber-Security** : Console de logs en temps réel et pilotage des moteurs IA Mathias.
- **Growth Hub** : Usine à coupons "Cinema Ticket", radar de campagnes et radar d'acquisition.
- **Centre de Support Premium** : Messagerie support immersive avec arbitrage direct des remboursements.

### 🎓 Espace Étudiant (Android-First)
- **Expérience Immersive** : Navigation par pilules tactiles, mode sombre profond et texture grainée.
- **Ndara Wallet** : Portefeuille personnel rechargeable via Orange Money, MTN et Wave.
- **Tuteur MATHIAS** : Coach IA disponible 24h/24 intégré directement dans le lecteur de cours.
- **Certification de Prestige** : Génération de diplômes HD avec sceau de sécurité et vérification en ligne.

### 👨‍🏫 Espace Expert (Wealth Management)
- **Gestionnaire de Catalogue** : Interface de création assistée par l'IA Mathias.
- **Finances Mobiles** : Suivi des ventes et demandes de retrait directes vers Mobile Money.
- **Impact Communautaire** : Annuaire des élèves et messagerie instantanée de type WhatsApp.

## 🛠️ Stack Technique & Prestige
- **Framework** : Next.js 14 (App Router)
- **Base de données** : Firebase Firestore (Real-time Sync)
- **IA** : Firebase Genkit & Gemini 1.5 Flash (Moteur Mathias)
- **Média** : Cloudflare R2 & Bunny.net (Streaming Sécurisé)
- **Paiements** : MeSomb, Moneroo & CinetPay

## 🚀 Déploiement & CI/CD (GitHub)

Ce projet est configuré pour un déploiement continu.

### 1. Liaison GitHub
Pour envoyer votre code sur GitHub :
```bash
git init
git add .
git commit -m "Initial commit Ndara Afrique v2.5"
git branch -M main
git remote add origin https://github.com/VOTRE_NOM/Ndaraafrique.git
git push -u origin main
```

### 2. Déploiement Automatique
Le fichier `.github/workflows/firebase-hosting-pull-request.yml` gère automatiquement la prévisualisation de vos changements. Pour la production :
- **Vercel** : Liez votre dépôt à Vercel. Il détectera automatiquement la configuration Next.js.
- **Firebase** : Utilisez `firebase deploy` pour mettre à jour les règles de sécurité (`firestore.rules`) et les fonctions.

### 🔐 Variables d'Environnement Requises
Assurez-vous de configurer les secrets suivants dans GitHub ou votre plateforme d'hébergement :
- `FIREBASE_SERVICE_ACCOUNT_KEY` : Clé JSON du compte de service.
- `MESOMB_APPLICATION_KEY`, `MESOMB_ACCESS_KEY`, `MESOMB_SECRET_KEY`.
- `GEMINI_API_KEY` : Pour le moteur Mathias.
- `BUNNY_API_KEY` : Pour le streaming vidéo.

---
**"Bara ala, Tonga na ndara."**
*L'éducation est le levier de l'émergence. Ndara Afrique en est l'infrastructure.*
