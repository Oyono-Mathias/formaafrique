import type { Course, User, Testimonial, Category, Module } from './types';

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
    date_creation: new Date('2025-10-31').toISOString(),
    publie: true,
    auteur: "Admin FormaAfrique",
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
    date_creation: new Date('2024-07-20').toISOString(),
    publie: true,
    auteur: "David Okoro",
    modules: oldModules,
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
    date_creation: new Date('2024-07-18').toISOString(),
    publie: true,
    auteur: "David Okoro",
    modules: oldModules,
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
