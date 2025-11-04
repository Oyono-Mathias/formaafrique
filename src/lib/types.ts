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
  id?: string;
  titre: string;
  url: string;
  duree?: number | null;
  ordre: number;
}

export interface Module {
  id?: string;
  titre: string;
  description: string;
  ordre: number;
  videos: Video[];
}

export interface Course {
  id?: string; // Firestore ID will be added by the hook
  slug?: string;
  titre: string;
  categorie: Category;
  description: string;
  image: string; // maps to imageId in placeholder-images
  niveau: 'Débutant' | 'Intermédiaire' | 'Avancé';
  langue: string;
  prix: number;
  modules: Module[]; // This can be used for summary or if not using subcollections
  date_creation: Timestamp | string; // Can be a Timestamp from Firestore
  publie: boolean;
  auteur: string;
  instructorId?: string; // ID of the instructor (formateur)
}


export interface UserProfile {
  name: string;
  email: string;
  createdAt: Timestamp;
  photoURL: string | null;
  role: 'admin' | 'etudiant' | 'formateur';
  paysOrigine: string;
  paysActuel: string;
  bio?: string;
  skills?: string[];
}

export interface InstructorProfile extends UserProfile {
    specialite?: string;
    headline?: string;
}

export interface Enrollment {
    id?: string;
    studentId: string;
    studentName: string;
    courseId: string;
    courseTitle: string;
    enrollmentDate: Timestamp;
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
    id?: string;
    courseId: string;
    userId: string;
    progressPercentage: number;
    lastUpdated: Timestamp;
    courseTitle: string;
}

export interface Donation {
  id?: string;
  donateurId: string;
  donateurNom: string;
  donateurEmail: string;
  montant: number;
  devise: string;
  date: Timestamp;
  statut: 'succes' | 'en_attente' | 'echec';
  moyenPaiement: 'carte' | 'mobile_money' | 'inconnu';
  paysOrigine: string;
}
