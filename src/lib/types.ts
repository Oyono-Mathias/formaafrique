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
  id: string;
  titre: string;
  videos: Video[];
}

export interface Course {
  id?: string; // Firestore ID will be added by the hook
  titre: string;
  categorie: Category;
  description: string;
  image: string; // maps to imageId in placeholder-images
  niveau: 'Débutant' | 'Intermédiaire' | 'Avancé';
  langue: string;
  prix: number;
  modules: Module[];
  date_creation: Timestamp | string; // Can be a Timestamp from Firestore
  publie: boolean;
  auteur: string;
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
  name:string;
  course: string;
  quote: string;
  imageId: string;
}

export interface CourseProgress {
    courseId: string;
    userId: string;
    completedVideos: string[];
    progressPercentage: number;
    lastUpdated: Timestamp;
}
