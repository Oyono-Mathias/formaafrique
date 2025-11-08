import type { Timestamp } from 'firebase/firestore';

export interface Category {
  id?: string;
  name: string;
  description: string;
}

export interface Video {
  id?: string;
  titre: string;
  url: string;
  ordre: number;
}

export interface Module {
  id?: string;
  titre: string;
  description: string;
  ordre: number;
  videos?: string[];
}

export interface Course {
  id?: string; // Firestore ID will be added by the hook
  slug: string;
  titre: string;
  categorie: string; // Now a string, not a type
  description: string;
  image: string; // maps to imageId in placeholder-images
  niveau: 'Débutant' | 'Intermédiaire' | 'Avancé';
  langue: string;
  prix: number;
  date_creation: Timestamp | string; // Can be a Timestamp from Firestore
  publie: boolean;
  auteur: string;
  instructorId: string; // ID of the instructor (formateur)
  statut: 'en_attente' | 'approuvee' | 'rejetee';
  dateValidation?: Timestamp;
  motifRejet?: string;
}


export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  createdAt: Timestamp;
  photoURL: string | null;
  role: 'admin' | 'etudiant' | 'formateur';
  status: 'actif' | 'suspendu';
  paysOrigine: string;
  paysActuel: string;
  bio?: string;
  skills?: string[];
  followers?: string[];
  following?: string[];
  friends?: string[];
  online?: boolean;
  lastSeen?: Timestamp;
}

export interface InstructorProfile extends UserProfile {
    specialite?: string;
    headline?: string;
}

export interface VideoProgress {
  watched: boolean;
  watchedAt?: Timestamp;
  lastPosition?: number;
}

export interface ModuleProgress {
  progress: number;
  videos: { [videoId: string]: VideoProgress };
}

export interface Enrollment {
    id?: string; // This will be the enrollment doc ID, typically same as courseId for simplicity
    studentId: string;
    courseId: string;
    courseTitle: string;
    enrollmentDate: Timestamp;
    progression: number; // Overall course progress (0 to 100)
    modules?: { [moduleId: string]: ModuleProgress };
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

export interface UserActivityLog {
    id?: string;
    userId: string;
    name: string;
    role: string;
    action: string;
    details: string;
    timestamp: Timestamp;
    status: 'succes' | 'echec';
}

export interface AdminNotification {
    id?: string;
    type: 'nouveau_cours' | 'nouveau_paiement' | 'nouvelle_inscription' | 'modification_profil' | 'demande_validation';
    title: string;
    message: string;
    createdAt: Timestamp;
    read: boolean;
    link?: string;
}
    
export interface InstructorRequest {
    id?: string;
    userId: string;
    userName: string;
    userEmail: string;
    requestDate: Timestamp;
    status: 'pending' | 'approved' | 'rejected';
}

export interface CommunityPost {
    id?: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    authorImage: string;
    tags: string[];
    createdAt: Timestamp;
    commentCount: number;
    voteCount: number;
}

export interface FriendRequest {
  id?: string;
  from: string;
  to: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp;
}

export interface Chat {
    id?: string;
    members: string[];
    lastMessage: string;
    lastTimestamp: Timestamp;
    unreadCounts: { [uid: string]: number };
}

export interface Message {
    id?: string;
    from: string;
    text: string;
    attachments: string[]; // Array of URLs
    timestamp: Timestamp;
    seen: boolean;
}

export interface Notification {
  id?: string;
  toUid: string;
  fromUid: string;
  type: 'friend_request' | 'new_message' | 'course_update';
  payload: {
    fromName?: string;
    [key: string]: any;
  };
  read: boolean;
  createdAt: Timestamp;
}


// This is a temporary API route to fetch collections from the client side
// as server components are not fully supported with the current firebase setup
export interface GetCollectionApiRequest {
    path: string;
    filters?: { field: string; op: any; value: any }[];
}
