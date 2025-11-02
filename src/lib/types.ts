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

export interface Course {
  id: string;
  title: string;
  category: Category;
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
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  whatYouWillLearn: string[];
  modules: Module[];
  price: number; // 0 if free
  dateAdded: string; // ISO 8601 date string
}

export interface Module {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  content: string;
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
