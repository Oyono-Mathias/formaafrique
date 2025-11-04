// This is a script to seed the Firestore database with initial courses.
// IMPORTANT: To run this script, you would typically use a tool like `ts-node`
// from your terminal in a secure, server-side environment.
// Example command: `ts-node -r dotenv/config src/scripts/seed-courses.ts`
// Ensure you have `ts-node` and `dotenv` installed as dev dependencies.
//
// This script is NOT meant to be run in the browser.

import { collection, addDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Manually configure Firebase Admin SDK or a client SDK with sufficient privileges
// Note: Using client SDK for seeding is not recommended for production due to security rules.
// This is a simplified example. For a real project, use Firebase Admin SDK in a Node.js environment.

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log(`Firebase Initialized for project: ${firebaseConfig.projectId}`);

type Category = 
  | 'Entrepreneuriat & Commerce'
  | 'Compétences numériques'
  | 'Agriculture & Agro-industrie'
  | 'Métiers manuels & Artisanat'
  | 'Éducation & Renforcement des capacités'
  | 'Santé & Bien-être'
  | 'Langues & Communication'
  | 'Finances & Inclusion économique';

const coursesToSeed = [
    // Entrepreneuriat & Commerce
    { titre: 'Création d’entreprise', categorie: 'Entrepreneuriat & Commerce', image: 'course-entrepreneurship' },
    { titre: 'Business plan', categorie: 'Entrepreneuriat & Commerce', image: 'course-entrepreneurship' },
    { titre: 'Import-export (achat sur Alibaba)', categorie: 'Entrepreneuriat & Commerce', image: 'course-marketing' },
    { titre: 'E-commerce (Shopify, Jumia, etc.)', categorie: 'Entrepreneuriat & Commerce', image: 'course-marketing' },
    { titre: 'Micro-entrepreneuriat', categorie: 'Entrepreneuriat & Commerce', image: 'course-entrepreneurship' },
    // Compétences numériques
    { titre: 'Marketing digital', categorie: 'Compétences numériques', image: 'course-marketing' },
    { titre: 'Développement web & mobile', categorie: 'Compétences numériques', image: 'course-dev-web' },
    { titre: 'Montage vidéo & création de contenu', categorie: 'Compétences numériques', image: 'course-dev-web' },
    { titre: 'Utilisation d’outils (Canva, Google Workspace)', categorie: 'Compétences numériques', image: 'course-project-management' },
    { titre: 'Cybersécurité de base', categorie: 'Compétences numériques', image: 'course-ai-ml' },
    // Agriculture & Agro-industrie
    { titre: 'Agriculture intelligente', categorie: 'Agriculture & Agro-industrie', image: 'course-data-science' },
    { titre: 'Transformation des produits agricoles', categorie: 'Agriculture & Agro-industrie', image: 'course-data-science' },
    { titre: 'Commercialisation des produits locaux', categorie: 'Agriculture & Agro-industrie', image: 'course-marketing' },
    { titre: 'Élevage et pisciculture', categorie: 'Agriculture & Agro-industrie', image: 'course-data-science' },
    { titre: 'Techniques agroécologiques', categorie: 'Agriculture & Agro-industrie', image: 'course-data-science' },
    // Métiers manuels & Artisanat
    { titre: 'Couture, teinture', categorie: 'Métiers manuels & Artisanat', image: 'course-project-management' },
    { titre: 'Coiffure, esthétique', categorie: 'Métiers manuels & Artisanat', image: 'course-project-management' },
    { titre: 'Menuiserie, maçonnerie, électricité', categorie: 'Métiers manuels & Artisanat', image: 'course-project-management' },
    { titre: 'Cuisson et transformation alimentaire', categorie: 'Métiers manuels & Artisanat', image: 'course-project-management' },
    { titre: 'Artisanat (vannerie, poterie, bijoux)', categorie: 'Métiers manuels & Artisanat', image: 'course-project-management' },
    // Éducation & Renforcement des capacités
    { titre: 'Tutoriels scolaires', categorie: 'Éducation & Renforcement des capacités', image: 'course-project-management' },
    { titre: 'Préparation aux examens', categorie: 'Éducation & Renforcement des capacités', image: 'course-project-management' },
    { titre: 'Formation des enseignants', categorie: 'Éducation & Renforcement des capacités', image: 'course-project-management' },
    { titre: 'Littératie numérique et financière', categorie: 'Éducation & Renforcement des capacités', image: 'course-project-management' },
    { titre: 'Éducation civique', categorie: 'Éducation & Renforcement des capacités', image: 'course-project-management' },
    // Santé & Bien-être
    { titre: 'Hygiène et prévention', categorie: 'Santé & Bien-être', image: 'course-ai-ml' },
    { titre: 'Soins à domicile', categorie: 'Santé & Bien-être', image: 'course-ai-ml' },
    { titre: 'Nutrition', categorie: 'Santé & Bien-être', image: 'course-ai-ml' },
    { titre: 'Santé mentale', categorie: 'Santé & Bien-être', image: 'course-ai-ml' },
    { titre: 'Formation des agents de santé', categorie: 'Santé & Bien-être', image: 'course-ai-ml' },
    // Langues & Communication
    { titre: 'Langues officielles (français, anglais)', categorie: 'Langues & Communication', image: 'course-project-management' },
    { titre: 'Langues locales', categorie: 'Langues & Communication', image: 'course-project-management' },
    { titre: 'Communication interpersonnelle', categorie: 'Langues & Communication', image: 'course-project-management' },
    { titre: 'Prise de parole en public', categorie: 'Langues & Communication', image: 'course-project-management' },
    { titre: 'Rédaction professionnelle', categorie: 'Langues & Communication', image: 'course-project-management' },
    // Finances & Inclusion économique
    { titre: 'Épargne et microfinance', categorie: 'Finances & Inclusion économique', image: 'course-marketing' },
    { titre: 'Gestion de trésorerie', categorie: 'Finances & Inclusion économique', image: 'course-marketing' },
    { titre: 'Mobile money', categorie: 'Finances & Inclusion économique', image: 'course-marketing' },
    { titre: 'Comptabilité de base', categorie: 'Finances & Inclusion économique', image: 'course-marketing' },
    { titre: 'Investissement solidaire', categorie: 'Finances & Inclusion économique', image: 'course-marketing' },
];

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

async function seedDatabase() {
    const coursesCollectionRef = collection(db, 'courses');
    let coursesCreated = 0;

    console.log(`Starting to seed ${coursesToSeed.length} courses...`);

    for (const course of coursesToSeed) {
        try {
            const docData = {
                titre: course.titre,
                slug: slugify(course.titre),
                categorie: course.categorie as Category,
                description: `Formation sur ${course.titre.toLowerCase()} pour vous aider à maîtriser les compétences clés.`,
                image: course.image, // Placeholder image ID
                niveau: 'Débutant' as 'Débutant' | 'Intermédiaire' | 'Avancé',
                langue: 'Français',
                prix: 0,
                publie: true,
                date_creation: serverTimestamp(),
                auteur: 'Admin FormaAfrique', // Default author
                instructorId: 'ADMIN_USER_ID', // Replace with a real admin user ID
                modules: []
            };

            await addDoc(coursesCollectionRef, docData);
            coursesCreated++;
            console.log(` -> Successfully created: ${course.titre}`);
        } catch (error) {
            console.error(`Error creating course "${course.titre}":`, error);
        }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`Total courses created: ${coursesCreated}/${coursesToSeed.length}`);

    // In a real script, you might want to close the connection if using Admin SDK
    // process.exit(0);
}

// Check if running in a Node.js environment
if (typeof process !== 'undefined') {
    seedDatabase().catch(e => {
        console.error("Seeding failed with an unhandled error:", e);
        process.exit(1);
    });
} else {
    console.warn("This script is intended to be run in a Node.js environment, not in the browser.");
}
