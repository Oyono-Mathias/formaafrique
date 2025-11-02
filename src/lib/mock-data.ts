import type { Course, User, Testimonial, Category, Module } from './types';

const instructors = {
  yannick: { name: 'Yannick Noah', title: 'Ingénieur Full-Stack & IA', avatarId: 'instructor-yann' },
  aisha: { name: 'Aisha Keita', title: 'Stratège en Marketing & Data Scientist', avatarId: 'instructor-aisha' },
  david: { name: 'David Okoro', title: 'Serial Entrepreneur & Coach Agile', avatarId: 'instructor-david' },
};

const oldModules: Module[] = [
    { id: 'm1', titre: 'De l\'idée au projet', videos: [{titre: "Introduction", url: "#"}]},
    { id: 'm2', titre: 'Structure du Business Plan', videos: [{titre: "Les sections", url: "#"}]},
];


export const courses: Course[] = [
  {
    id: 'ecommerce-importation',
    titre: "E-commerce & Importation",
    categorie: "Entrepreneuriat & Commerce",
    description: "Formation complète sur le marketing digital, e-commerce et importation depuis Alibaba.",
    image: "course-marketing",
    niveau: "Débutant",
    langue: "Français",
    prix: 0,
    modules: [
      {
        id: "m1",
        titre: "Introduction au cours sur le Marketing Digital",
        videos: [
          {"titre": "Bienvenue dans le cours", "url": "#"},
          {"titre": "Objectifs de la formation", "url": "#"}
        ]
      },
      {
        id: "m2",
        titre: "L’évolution du web jusqu'aux réseaux sociaux",
        videos: [
          {"titre": "Vidéo 1", "url": "#"},
          {"titre": "Vidéo 2", "url": "#"}
        ]
      }
    ],
    date_creation: "2025-10-31",
    publie: true,
    auteur: "Admin FormaAfrique",
    // --- Deprecated fields ---
    shortDescription: "Formation complète sur le marketing digital, e-commerce et importation depuis Alibaba.",
    longDescription: "Apprenez le marketing digital, comment monter votre business de e-commerce et comment importer des produits depuis des plateformes comme Alibaba.",
    instructor: instructors.david,
    imageId: 'course-marketing',
    enrollmentCount: 4210,
    duration: '10 semaines',
    whatYouWillLearn: ['Marketing Digital', 'E-commerce', 'Importation Alibaba'],
    dateAdded: '2025-10-31T10:00:00Z',
  },
  // --- Other courses adapted to new structure ---
  {
    id: 'creation-entreprise',
    titre: 'Les étapes clés de la création d’entreprise',
    categorie: 'Entrepreneuriat & Commerce',
    description: 'De l’idée à l’immatriculation, maîtrisez chaque étape pour lancer votre projet avec succès.',
    image: 'course-entrepreneurship',
    niveau: 'Débutant',
    langue: 'Français',
    prix: 15,
    date_creation: '2024-07-20',
    publie: true,
    auteur: instructors.david.name,
    modules: oldModules,
    // --- Deprecated fields ---
    shortDescription: 'De l’idée à l’immatriculation, maîtrisez chaque étape pour lancer votre projet avec succès.',
    longDescription: 'Ce cours complet vous guide pas à pas dans le processus de création d’entreprise. Vous apprendrez à valider votre idée, à choisir votre statut juridique, et à accomplir toutes les démarches administratives.',
    instructor: instructors.david,
    imageId: 'course-entrepreneurship',
    enrollmentCount: 2345,
    duration: '6 semaines',
    whatYouWillLearn: ['Valider son idée', 'Choisir son statut juridique', 'Immatriculer son entreprise'],
    dateAdded: '2024-07-20T10:00:00Z',
  },
  {
    id: 'business-plan',
    titre: 'Rédiger un Business Plan convaincant',
    categorie: 'Entrepreneuriat & Commerce',
    description: 'Apprenez à structurer un business plan qui séduira les investisseurs et guidera votre croissance.',
    image: 'course-entrepreneurship',
    niveau: 'Intermédiaire',
    langue: 'Français',
    prix: 20,
    date_creation: '2024-07-18',
    publie: true,
    auteur: instructors.david.name,
    modules: oldModules,
    // --- Deprecated fields ---
    shortDescription: 'Apprenez à structurer un business plan qui séduira les investisseurs et guidera votre croissance.',
    longDescription: 'Un business plan solide est la feuille de route de votre succès. Ce cours vous apprend à définir votre marché, à projeter vos finances et à présenter votre vision de manière professionnelle.',
    instructor: instructors.david,
    imageId: 'course-entrepreneurship',
    enrollmentCount: 1890,
    duration: '4 semaines',
    whatYouWillLearn: ['Analyse de marché', 'Prévisions financières', 'Stratégie marketing'],
    dateAdded: '2024-07-18T10:00:00Z',
  },
];


export const users: User[] = [
  {
    id: 'user-1',
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    avatarId: 'user-avatar',
    enrolledCourses: ['developpement-web', 'business-plan']
  }
];

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Fatima Diallo',
    course: 'Développement Web & Mobile',
    quote: 'Cette formation a complètement changé ma carrière. Les explications sont claires et les projets pratiques m\'ont donné la confiance nécessaire pour postuler à des offres d\'emploi.',
    imageId: 'testimonial-fatima',
  },
  {
    id: 't2',
    name: 'Samuel Adebayo',
    course: 'Création d’entreprise',
    quote: 'Indispensable pour quiconque veut lancer son business en Afrique. Le cours est très concret et adapté à nos réalités. J\'ai pu lancer ma startup grâce aux conseils reçus.',
    imageId: 'testimonial-samuel',
  },
  {
    id: 't3',
    name: 'Chloé Dubois',
    course: 'Marketing Digital',
    quote: 'J\'avais des difficultés à trouver mes premiers clients. Après ce cours, j\'ai une stratégie claire et mes ventes ont décollé. Un grand merci à l\'équipe de FormaAfrique !',
    imageId: 'testimonial-chloe',
  }
];
