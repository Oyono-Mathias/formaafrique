import type { Testimonial } from './types';

// This file is now primarily for mock data like testimonials.
// The course data is now intended to be sourced from Firestore.

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
