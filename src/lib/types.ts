import type { Timestamp } from 'firebase/firestore';

export type Category = 
  | 'Entrepreneuriat & Commerce'
  | 'Compétences numériques'
  | 'Agriculture & Agro-industrie'
  | 'Métiers manuels & Artisanat'
  | 'Éducation & Renforcement des capacités'
  | 'Santé & Bien-être'
  | 'Langues & Communication'
  | 'Finances & Inclusion économique';

export interface Video {
  titre: string;
  url: string;
}

export interface Module {
  id: string; // Changed from title to id for key purposes
  titre: string;
  videos: Video[];
}

export interface Course {
  id: string;
  titre: string;
  categorie: Category;
  description: string;
  image: string; // maps to imageId
  niveau: 'Débutant' | 'Intermédiaire' | 'Avancé';
  langue: string;
  prix: number;
  modules: Module[];
  date_creation: string; // ISO 8601 date string
  publie: boolean;
  auteur: string; // maps to instructor
  // --- Deprecated fields to be removed/migrated ---
  shortDescription: string;
  longDescription: string;
  instructor: {
    name: string;
    title: string;
    avatarId: string;
  };
  imageId: string;
  enrollmentCount: number;
  duration: string;
  whatYouWillLearn: string[];
  dateAdded: string;
}


export interface UserProfile {
  name: string;
  email: string;
  createdAt: Timestamp;
  photoURL: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarId: string;
  enrolledCourses: string[]; // array of course IDs
}

export interface Testimonial {
  id: string;
  name: string;
  course: string;
  quote: string;
  imageId: string;
}
