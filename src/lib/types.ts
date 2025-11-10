

import type { Timestamp } from 'firebase/firestore';

export interface Category {
  id?: string;
  name: string;
  description: string;
  createdAt: Timestamp;
}

export interface Video {
  id?: string;
  title: string;
  duration?: number;
  driveUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  platform: 'youtube' | 'drive' | 'other';
  videoId?: string;
  storagePath?: string;
  order: number;
  createdAt: Timestamp;
  published: boolean;
  moduleId: string; // Keep track of the parent module
}

export interface Module {
  id?: string;
  title: string;
  order: number;
  summary: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Course {
  id?: string; // Firestore ID
  title: string;
  summary: string;
  categoryId: string;
  keywords: string[];
  coverUrl?: string; // URL for the course cover image
  authorId: string; // UID of the instructor
  price: number;
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  statut?: 'brouillon' | 'en_attente' | 'approuvee' | 'rejetee'; // Course validation status
  motifRejet?: string; // Reason for rejection, if applicable
  dateValidation?: Timestamp; // Date of approval/rejection
}

export interface ContentIndex {
    id?: string; // Should be 'contentIndex'
    lastSyncedAt: Timestamp;
    counts: {
        categories: number;
        formations: number;
        modules: number;
        videos: number;
    };
    summary: {
        [formationId: string]: {
            title: string;
            shortSummary: string;
            keywords: string[];
        };
    };
}

export interface Embedding {
    id?: string; // Corresponds to the source document ID (e.g., videoId, moduleId)
    type: "video" | "module" | "formation";
    text: string; // The concatenated text content used for embedding
    embedding: number[]; // The vector representation
    createdAt: Timestamp;
    updatedAt: Timestamp;
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
  formationId?: string;
  moduleLevel?: string;
  infractions?: number;
  scoreReputation?: number;
  xp?: number;
  badges?: string[];
}

export interface InstructorProfile extends UserProfile {
    specialite?: string;
    headline?: string;
    videoUrl?: string;
    socialLinks?: {
        facebookUrl?: string;
        instagramUrl?: string;
        twitterUrl?: string;
        youtubeUrl?: string;
    };
    validation_status: 'incomplete' | 'pending' | 'validated' | 'rejected';
    score_validation?: number;
    derniere_mise_a_jour?: string;
    charteAcceptee: boolean;
    nombreEtudiants?: number;
    nombreFormationsPubliees?: number;
    notationMoyenne?: number;
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
  courseId?: string; // Optional: Link donation to a specific course
  transactionId?: string; // ID from payment provider
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
    type: 'nouveau_cours' | 'nouveau_paiement' | 'nouvelle_inscription' | 'modification_profil' | 'demande_validation' | 'possible_scam';
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
    status: 'pending' | 'approved' | 'rejected' | 'éligible' | 'en_attente' | 'refusé';
    specialite: string;
    motivation: string;
    videoUrl: string;
    socialLinks?: {
        facebookUrl?: string;
        instagramUrl?: string;
        twitterUrl?: string;
        youtubeUrl?: string;
    };
    scoreReputation?: number;
    scoreFinal?: number;
    feedbackMessage?: string;
    badge?: string;
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
    formationId?: string;
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
    formationId: string; // ID of the formation this chat belongs to
}

export interface Message {
    id?: string;
    from: string;
    text: string;
    attachments: string[]; // Array of URLs
    timestamp: Timestamp;
    seen: boolean;
    auto?: boolean; // True if message is from an AI agent
}

export interface Notification {
  id?: string;
  toUid: string;
  fromUid: string;
  type: 'friend_request' | 'new_message' | 'course_update' | 'moderation_warning';
  payload: {
    fromName?: string;
    [key: string]: any;
  };
  read: boolean;
  createdAt: Timestamp;
}

export interface GroupChat {
  id?: string; // The ID will be the formationId
  formationId: string;
  name: string;
  description: string;
  createdAt: Timestamp;
}

export interface GroupMessage {
  id?: string;
  authorId: string;
  authorName: string;
  authorImage: string;
  text: string;
  timestamp: Timestamp;
  auto?: boolean; // True if message is from an AI agent
}


export interface ModerationLog {
    id?: string;
    msgId: string;
    chatId: string;
    fromUid: string;
    text: string;
    verdict: 'allowed' | 'blocked' | 'review' | 'warn' | 'quarantine' | 'escalate';
    action: 'none' | 'flag' | 'block_and_flag';
    category: 'none' | 'payment_request' | 'external_contact' | 'off_topic' | 'abuse';
    score: number;
    timestamp: Timestamp;
}

export interface AiFlag {
    id?: string;
    msgId: string;
    chatId: string;
    fromUid: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
    status: 'pending_review' | 'resolved' | 'dismissed';
    timestamp: Timestamp;
}

export interface ModerationAppeal {
    id?: string;
    userId: string;
    flagId: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Timestamp;
}

export interface TutorFeedback {
  id?: string;
  userId: string;
  formationId?: string;
  query: string;
  answer: string;
  isHelpful: boolean;
  notes?: string;
  createdAt: Timestamp;
}


// This is a temporary API route to fetch collections from the client side
// as server components are not fully supported with the current firebase setup
export interface GetCollectionApiRequest {
    path: string;
    filters?: { field: string; op: any; value: any }[];
}

// Interface for a wishlist item
export interface WishlistItem {
  id: string;
  userId: string;
  courseId: string;
  createdAt: Timestamp;
}
