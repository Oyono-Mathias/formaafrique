// This is a script to seed the Firestore database with initial courses and their modules.
// IMPORTANT: To run this script, you would typically use a tool like `ts-node`
// from your terminal in a secure, server-side environment.
// Example command: `npm run db:seed`
// Ensure you have `ts-node` and `dotenv` installed as dev dependencies.
//
// This script is NOT meant to be run in the browser.

import { collection, addDoc, getDocs, query, where, serverTimestamp, getFirestore, writeBatch } from 'firebase/firestore';
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

const slugify = (text: string) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}


const getImageIdFromTitle = (title: string): string => {
    const lowerCaseTitle = title.toLowerCase();
    const imageKeywords: { [key: string]: string[] } = {
        'course-dev-web': ['développement', 'web', 'mobile', 'code', 'html', 'css', 'javascript', 'python', 'flutter'],
        'course-marketing': ['marketing', 'digital', 'commerce', 'vente', 'publicité', 'réseaux sociaux', 'import-export', 'e-commerce', 'alibaba'],
        'course-entrepreneurship': ['entreprise', 'business', 'entrepreneuriat', 'startup', 'micro-entrepreneuriat', 'investissement'],
        'course-data-science': ['agriculture', 'données', 'data', 'science', 'santé', 'transformation', 'agro-industrie', 'agroécologiques', 'élevage', 'pisciculture'],
        'course-ai-ml': ['ai', 'intelligence artificielle', 'cybersécurité', 'littératie'],
        'course-project-management': ['gestion', 'management', 'outils', 'canva', 'artisanat', 'couture', 'comptabilité', 'langues', 'tutoriels', 'examen', 'civique', 'coiffure', 'menuiserie'],
    };

    for (const id in imageKeywords) {
        for (const keyword of imageKeywords[id]) {
            if (lowerCaseTitle.includes(keyword)) {
                return id;
            }
        }
    }
    return 'course-project-management'; // Fallback image
};


const coursesToSeed = [
    // 1. Formations entrepreneuriales & commerciales
    { titre: 'Création d’entreprise', categorie: 'Entrepreneuriat & Commerce' },
    { titre: 'Business plan', categorie: 'Entrepreneuriat & Commerce' },
    { titre: 'Import-export (Alibaba, etc.)', categorie: 'Entrepreneuriat & Commerce' },
    { titre: 'E-commerce (Shopify, Jumia, etc.)', categorie: 'Entrepreneuriat & Commerce' },
    { titre: 'Micro-entrepreneuriat', categorie: 'Entrepreneuriat & Commerce' },

    // 2. Compétences numériques
    { titre: 'Marketing digital', categorie: 'Compétences numériques' },
    { titre: 'Développement web & mobile', categorie: 'Compétences numériques' },
    { titre: 'Montage vidéo & création de contenu', categorie: 'Compétences numériques' },
    { titre: 'Outils numériques (Canva, Google Workspace, WhatsApp Business)', categorie: 'Compétences numériques' },
    { titre: 'Cybersécurité de base', categorie: 'Compétences numériques' },

    // 3. Agriculture & agro-industrie
    { titre: 'Agriculture intelligente', categorie: 'Agriculture & Agro-industrie' },
    { titre: 'Transformation des produits agricoles', categorie: 'Agriculture & Agro-industrie' },
    { titre: 'Commercialisation des produits locaux', categorie: 'Agriculture & Agro-industrie' },
    { titre: 'Élevage et pisciculture', categorie: 'Agriculture & Agro-industrie' },
    { titre: 'Techniques agroécologiques', categorie: 'Agriculture & Agro-industrie' },

    // 4. Métiers manuels & artisanaux
    { titre: 'Couture & teinture', categorie: 'Métiers manuels & Artisanat' },
    { titre: 'Coiffure & esthétique', categorie: 'Métiers manuels & Artisanat' },
    { titre: 'Menuiserie, maçonnerie, électricité', categorie: 'Métiers manuels & Artisanat' },
    { titre: 'Transformation alimentaire', categorie: 'Métiers manuels & Artisanat' },
    { titre: 'Artisanat (vannerie, poterie, bijoux)', categorie: 'Métiers manuels & Artisanat' },

    // 5. Éducation & renforcement des capacités
    { titre: 'Tutoriels scolaires', categorie: 'Éducation & Renforcement des capacités' },
    { titre: 'Préparation aux examens', categorie: 'Éducation & Renforcement des capacités' },
    { titre: 'Formation des enseignants', categorie: 'Éducation & Renforcement des capacités' },
    { titre: 'Littératie numérique & financière', categorie: 'Éducation & Renforcement des capacités' },
    { titre: 'Éducation civique', categorie: 'Éducation & Renforcement des capacités' },

    // 6. Santé & bien-être
    { titre: 'Hygiène & prévention', categorie: 'Santé & Bien-être' },
    { titre: 'Soins à domicile', categorie: 'Santé & Bien-être' },
    { titre: 'Nutrition', categorie: 'Santé & Bien-être' },
    { titre: 'Santé mentale', categorie: 'Santé & Bien-être' },
    { titre: 'Formation des agents de santé', categorie: 'Santé & Bien-être' },

    // 7. Langues & communication
    { titre: 'Français, anglais, portugais', categorie: 'Langues & Communication' },
    { titre: 'Langues locales africaines', categorie: 'Langues & Communication' },
    { titre: 'Communication interpersonnelle', categorie: 'Langues & Communication' },
    { titre: 'Prise de parole en public', categorie: 'Langues & Communication' },
    { titre: 'Rédaction professionnelle', categorie: 'Langues & Communication' },

    // 8. Finances & inclusion économique
    { titre: 'Épargne & microfinance', categorie: 'Finances & Inclusion économique' },
    { titre: 'Gestion de trésorerie', categorie: 'Finances & Inclusion économique' },
    { titre: 'Mobile money (Orange Money, MTN MoMo, etc.)', categorie: 'Finances & Inclusion économique' },
    { titre: 'Comptabilité de base', categorie: 'Finances & Inclusion économique' },
    { titre: 'Investissement solidaire', categorie: 'Finances & Inclusion économique' },
];


async function seedCourses() {
    const coursesCollectionRef = collection(db, 'courses');
    let coursesCreated = 0;

    console.log(`Starting to seed ${coursesToSeed.length} courses...`);

    for (const course of coursesToSeed) {
        const slug = slugify(course.titre);
        const q = query(coursesCollectionRef, where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            try {
                const docData = {
                    titre: course.titre,
                    slug: slug,
                    categorie: course.categorie as Category,
                    description: `Formation sur ${course.titre.toLowerCase()} pour vous aider à maîtriser les compétences clés dans le domaine de ${course.categorie}.`,
                    image: getImageIdFromTitle(course.titre),
                    niveau: 'Débutant' as 'Débutant' | 'Intermédiaire' | 'Avancé',
                    langue: 'Français',
                    prix: 0,
                    publie: true,
                    date_creation: serverTimestamp(),
                    auteur: 'Admin FormaAfrique',
                    instructorId: 'ADMIN_USER_ID', // Replace with a real admin user ID
                };

                await addDoc(coursesCollectionRef, docData);
                coursesCreated++;
                console.log(` -> Successfully created: ${course.titre}`);
            } catch (error) {
                console.error(`Error creating course "${course.titre}":`, error);
            }
        } else {
            console.log(` -> Course already exists, skipping: ${course.titre}`);
        }
    }

    console.log(`\n✅ Course seeding complete!`);
    console.log(`Total courses created in this run: ${coursesCreated}`);
}

async function main() {
    await seedCourses();
}

// Check if running in a Node.js environment
if (typeof process !== 'undefined') {
    main().then(() => {
        console.log("\nSeeding process finished.");
        process.exit(0);
    }).catch(e => {
        console.error("Seeding failed with an unhandled error:", e);
        process.exit(1);
    });
} else {
    console.warn("This script is intended to be run in a Node.js environment, not in the browser.");
}
