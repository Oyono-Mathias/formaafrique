import type { Course, User, Testimonial } from './types';

export const courses: Course[] = [
  {
    id: 'developpement-web-moderne',
    title: 'Développement Web Moderne avec React & Node.js',
    category: 'Développement Web',
    shortDescription: 'Maîtrisez la création d\'applications web complètes avec les technologies les plus demandées.',
    longDescription: 'Ce cours complet vous guide à travers la création d\'applications web full-stack. Vous apprendrez à construire une interface utilisateur réactive avec React et une API RESTful robuste avec Node.js et Express. Nous couvrirons également les bases de données, l\'authentification et le déploiement.',
    instructor: { name: 'Yannick Noah', title: 'Ingénieur Full-Stack', avatarId: 'instructor-yann' },
    imageId: 'course-dev-web',
    enrollmentCount: 1254,
    duration: '12 semaines',
    level: 'Intermédiaire',
    price: 25,
    whatYouWillLearn: [
      'Construire des interfaces utilisateur dynamiques avec React',
      'Créer des API RESTful avec Node.js et Express',
      'Gérer l\'état de l\'application avec Redux',
      'Intégrer une base de données MongoDB',
      'Déployer des applications sur le cloud'
    ],
    modules: [
      { id: 'm1', title: 'Introduction au cours', duration: '10:32', videoUrl: '#', content: 'Présentation des objectifs du cours et des technologies utilisées.' },
      { id: 'm2', title: 'Les bases de React', duration: '45:12', videoUrl: '#', content: 'Composants, JSX, props et state.' },
      { id: 'm3', title: 'Création d\'un backend avec Node.js', duration: '55:40', videoUrl: '#', content: 'Mise en place d\'un serveur Express et des routes.' },
    ]
  },
  {
    id: 'marketing-digital-pour-startups',
    title: 'Marketing Digital pour Startups',
    category: 'Marketing',
    shortDescription: 'Acquérez les compétences pour faire décoller votre projet grâce au marketing digital.',
    longDescription: 'Apprenez les stratégies et les outils essentiels pour construire une présence en ligne forte, attirer vos premiers clients et développer votre startup. Ce cours couvre le SEO, le marketing sur les réseaux sociaux, le content marketing et l\'emailing.',
    instructor: { name: 'Aisha Keita', title: 'Stratège en Marketing Digital', avatarId: 'instructor-aisha' },
    imageId: 'course-marketing',
    enrollmentCount: 876,
    duration: '8 semaines',
    level: 'Débutant',
    price: 0,
    whatYouWillLearn: [
      'Définir une stratégie de marketing digital',
      'Optimiser votre site pour les moteurs de recherche (SEO)',
      'Gérer des campagnes publicitaires sur les réseaux sociaux',
      'Créer du contenu engageant',
      'Analyser les performances de vos campagnes'
    ],
    modules: [
        { id: 'm1', title: 'Introduction au Marketing Digital', duration: '12:05', videoUrl: '#', content: 'Les piliers du marketing en ligne et comment ils s\'appliquent aux startups.' },
        { id: 'm2', title: 'Maîtriser le SEO', duration: '38:20', videoUrl: '#', content: 'Recherche de mots-clés, optimisation on-page et off-page.' },
    ]
  },
  {
    id: 'entrepreneuriat-en-afrique',
    title: 'Fondamentaux de l\'Entrepreneuriat en Afrique',
    category: 'Entrepreneuriat',
    shortDescription: 'De l\'idée au business plan, lancez votre entreprise avec succès sur le continent.',
    longDescription: 'Ce cours est conçu spécifiquement pour les entrepreneurs africains. Il aborde les défis et opportunités uniques du continent, de la validation de l\'idée à la recherche de financement, en passant par la structuration juridique et le management d\'équipe.',
    instructor: { name: 'David Okoro', title: 'Serial Entrepreneur & Investisseur', avatarId: 'instructor-david' },
    imageId: 'course-entrepreneurship',
    enrollmentCount: 2103,
    duration: '10 semaines',
    level: 'Débutant',
    price: 10,
    whatYouWillLearn: [
      'Valider une idée de business sur le marché africain',
      'Rédiger un business plan convaincant',
      'Comprendre les aspects juridiques et fiscaux',
      'Stratégies de financement adaptées à l\'Afrique',
      'Construire et gérer une équipe performante'
    ],
    modules: [
        { id: 'm1', title: 'L\'état d\'esprit de l\'entrepreneur', duration: '15:30', videoUrl: '#', content: 'Développer la résilience et la vision nécessaires pour réussir.' },
        { id: 'm2', title: 'De l\'idée à l\'opportunité', duration: '42:50', videoUrl: '#', content: 'Techniques pour identifier et valider les besoins du marché.' },
    ]
  },
  {
    id: 'introduction-a-la-data-science',
    title: 'Introduction à la Data Science',
    category: 'Data Science',
    shortDescription: 'Apprenez à analyser des données et à en extraire des informations précieuses.',
    longDescription: 'Découvrez le monde fascinant de la science des données. Ce cours vous initie aux concepts fondamentaux de la collecte, du nettoyage, de l\'analyse et de la visualisation de données avec Python et ses bibliothèques populaires comme Pandas et Matplotlib.',
    instructor: { name: 'Aisha Keita', title: 'Data Scientist Senior', avatarId: 'instructor-aisha' },
    imageId: 'course-data-science',
    enrollmentCount: 950,
    duration: '9 semaines',
    level: 'Intermédiaire',
    price: 40,
    whatYouWillLearn: [
      'Les fondamentaux de Python pour la data science',
      'Manipuler des données avec Pandas',
      'Créer des visualisations avec Matplotlib et Seaborn',
      'Effectuer des analyses statistiques de base',
      'Communiquer ses résultats efficacement'
    ],
    modules: [
        { id: 'm1', title: 'Qu\'est-ce que la Data Science ?', duration: '11:20', videoUrl: '#', content: 'Un aperçu du domaine et de ses applications.' },
    ]
  },
  {
    id: 'ia-et-machine-learning',
    title: 'IA et Machine Learning : Les bases',
    category: 'Intelligence Artificielle',
    shortDescription: 'Comprenez les concepts clés de l\'IA et construisez vos premiers modèles de machine learning.',
    longDescription: 'Démystifiez l\'intelligence artificielle et le machine learning. Ce cours pratique vous enseignera les différents types d\'apprentissage automatique (supervisé, non supervisé) et vous guidera dans la construction de modèles prédictifs simples avec Scikit-learn.',
    instructor: { name: 'Yannick Noah', title: 'Ingénieur IA/ML', avatarId: 'instructor-yann' },
    imageId: 'course-ai-ml',
    enrollmentCount: 1530,
    duration: '14 semaines',
    level: 'Avancé',
    price: 50,
    whatYouWillLearn: [
      'Les concepts fondamentaux de l\'IA et du ML',
      'Construire des modèles de régression et de classification',
      'Évaluer la performance d\'un modèle',
      'Comprendre les réseaux de neurones simples',
      'Appliquer des algorithmes de clustering'
    ],
    modules: [
      { id: 'm1', title: 'Panorama de l\'Intelligence Artificielle', duration: '14:00', videoUrl: '#', content: 'Histoire, concepts et enjeux de l\'IA.' },
    ]
  },
  {
    id: 'gestion-de-projet-agile',
    title: 'Gestion de Projet Agile avec Scrum',
    category: 'Management',
    shortDescription: 'Apprenez à gérer des projets complexes de manière flexible et efficace avec la méthode Scrum.',
    longDescription: 'Maîtrisez le framework agile le plus populaire au monde. Ce cours vous plonge dans les rôles, événements et artefacts de Scrum. À travers des études de cas et des exercices pratiques, vous apprendrez à mener des projets qui apportent de la valeur rapidement et de manière itérative.',
    instructor: { name: 'David Okoro', title: 'Coach Agile Certifié', avatarId: 'instructor-david' },
    imageId: 'course-project-management',
    enrollmentCount: 780,
    duration: '6 semaines',
    level: 'Intermédiaire',
    price: 0,
    whatYouWillLearn: [
      'Les principes du manifeste Agile',
      'Le framework Scrum (rôles, événements, artefacts)',
      'Gérer un Product Backlog',
      'Planifier et exécuter des Sprints',
      'Animer les cérémonies Scrum (Daily, Review, Retrospective)'
    ],
    modules: [
      { id: 'm1', title: 'Pourquoi l\'Agile ?', duration: '13:15', videoUrl: '#', content: 'Les limites des méthodes traditionnelles et la naissance de l\'agilité.' },
    ]
  }
];

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    avatarId: 'user-avatar',
    enrolledCourses: ['developpement-web-moderne', 'entrepreneuriat-en-afrique']
  }
];

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Fatima Diallo',
    course: 'Développement Web Moderne',
    quote: 'Cette formation a complètement changé ma carrière. Les explications sont claires et les projets pratiques m\'ont donné la confiance nécessaire pour postuler à des offres d\'emploi.',
    imageId: 'testimonial-fatima',
  },
  {
    id: 't2',
    name: 'Samuel Adebayo',
    course: 'Fondamentaux de l\'Entrepreneuriat',
    quote: 'Indispensable pour quiconque veut lancer son business en Afrique. Le cours est très concret et adapté à nos réalités. J\'ai pu lancer ma startup grâce aux conseils reçus.',
    imageId: 'testimonial-samuel',
  },
  {
    id: 't3',
    name: 'Chloé Dubois',
    course: 'Marketing Digital pour Startups',
    quote: 'J\'avais des difficultés à trouver mes premiers clients. Après ce cours, j\'ai une stratégie claire et mes ventes ont décollé. Un grand merci à l\'équipe de FormaAfrique !',
    imageId: 'testimonial-chloe',
  }
];
