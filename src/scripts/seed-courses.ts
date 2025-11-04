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
     // Métiers manuels & artisanaux
    { titre: 'Couture, teinture', categorie: 'Métiers manuels & Artisanat', image: 'course-project-management' },
    { titre: 'Coiffure, esthétique', categorie: 'Métiers manuels & Artisanat', image: 'course-project-management' },
    { titre: 'Menuiserie, maçonnerie, électricité', categorie: 'Métiers manuels & Artisanat', image: 'course-project-management' },
    { titre: 'Cuisson et transformation alimentaire', categorie: 'Métiers manuels & Artisanat', image: 'course-data-science' },
    { titre: 'Artisanat (vannerie, poterie, bijoux)', categorie: 'Métiers manuels & Artisanat', image: 'course-project-management' },
    // Éducation & Renforcement des capacités
    { titre: 'Tutoriels scolaires', categorie: 'Éducation & Renforcement des capacités', image: 'course-project-management' },
    { titre: 'Préparation aux examens', categorie: 'Éducation & Renforcement des capacités', image: 'course-project-management' },
    { titre: 'Formation des enseignants', categorie: 'Éducation & Renforcement des capacités', image: 'course-project-management' },
    { titre: 'Littératie numérique et financière', categorie: 'Éducation & Renforcement des capacités', image: 'course-ai-ml' },
    { titre: 'Éducation civique', categorie: 'Éducation & Renforcement des capacités', image: 'course-project-management' },
    // Santé & Bien-être
    { titre: 'Hygiène et prévention (VIH, paludisme, grossesse)', categorie: 'Santé & Bien-être', image: 'course-data-science' },
    { titre: 'Soins à domicile', categorie: 'Santé & Bien-être', image: 'course-data-science' },
    { titre: 'Nutrition', categorie: 'Santé & Bien-être', image: 'course-data-science' },
    { titre: 'Santé mentale', categorie: 'Santé & Bien-être', image: 'course-ai-ml' },
    { titre: 'Formation des agents de santé', categorie: 'Santé & Bien-être', image: 'course-data-science' },
    // Langues & Communication
    { titre: 'Langues officielles (français, anglais, portugais)', categorie: 'Langues & Communication', image: 'course-project-management' },
    { titre: 'Langues locales (douala, fulfulde, lingala, etc.)', categorie: 'Langues & Communication', image: 'course-project-management' },
    { titre: 'Communication interpersonnelle', categorie: 'Langues & Communication', image: 'course-project-management' },
    { titre: 'Prise de parole en public', categorie: 'Langues & Communication', image: 'course-project-management' },
    { titre: 'Rédaction professionnelle', categorie: 'Langues & Communication', image: 'course-project-management' },
    // Finances & Inclusion économique
    { titre: 'Épargne et microfinance', categorie: 'Finances & Inclusion économique', image: 'course-marketing' },
    { titre: 'Gestion de trésorerie', categorie: 'Finances & Inclusion économique', image: 'course-project-management' },
    { titre: 'Mobile money (Orange Money, MTN MoMo, etc.)', categorie: 'Finances & Inclusion économique', image: 'course-marketing' },
    { titre: 'Comptabilité de base', categorie: 'Finances & Inclusion économique', image: 'course-project-management' },
    { titre: 'Investissement solidaire', categorie: 'Finances & Inclusion économique', image: 'course-entrepreneurship' },
];

const modulesData: { [key: string]: any[] } = {
    'marketing-digital': [
        { ordre: 1, titre: "Introduction au marketing digital", description: "Découvrez les fondements et les principaux concepts du marketing en ligne.", videos: [ { ordre: 1, titre: "Qu’est-ce que le marketing digital ?", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }, { ordre: 2, titre: "Les canaux de communication en ligne", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }] },
        { ordre: 2, titre: "Création de contenu pour les réseaux sociaux", description: "Apprenez à produire du contenu engageant et adapté à chaque plateforme.", videos: [ { ordre: 1, titre: "Créer un visuel attractif sur Canva", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }, { ordre: 2, titre: "Optimiser ses publications Facebook et Instagram", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }] },
        { ordre: 3, titre: "Publicité en ligne (Facebook & Google)", description: "Maîtrisez les bases de la publicité payante sur les réseaux sociaux et les moteurs de recherche.", videos: [ { ordre: 1, titre: "Créer une campagne Facebook Ads", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }, { ordre: 2, titre: "Introduction à Google Ads", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }] },
        { ordre: 4, titre: "Emailing et automatisation", description: "Découvrez comment fidéliser votre audience et automatiser vos communications.", videos: [ { ordre: 1, titre: "Comment construire une base d’emails", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }, { ordre: 2, titre: "Mettre en place une campagne automatisée", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }] },
        { ordre: 5, titre: "Analyse et performance", description: "Apprenez à mesurer l'efficacité de vos actions marketing.", videos: [ { ordre: 1, titre: "Comprendre Google Analytics", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }, { ordre: 2, titre: "Mesurer le ROI de ses campagnes", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }] },
    ],
    'developpement-web-mobile': [
        { ordre: 1, titre: "Introduction au développement web", description: "Les bases indispensables pour commencer à créer des sites web.", videos: [{ ordre: 1, titre: "HTML pour structurer votre page", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }, { ordre: 2, titre: "CSS pour styliser votre site", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }, { ordre: 3, titre: "JavaScript pour l'interactivité", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }] },
        { ordre: 2, titre: "Développement backend", description: "Apprenez à créer la logique serveur de vos applications.", videos: [{ ordre: 1, titre: "Introduction à Node.js", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }, { ordre: 2, titre: "Créer une API simple avec Express", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }] },
        { ordre: 3, titre: "Création d’application mobile avec Flutter", description: "Découvrez le framework de Google pour créer des applications natives pour iOS et Android.", videos: [{ ordre: 1, titre: "Installer Flutter et configurer son environnement", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }, { ordre: 2, titre: "Votre première application Flutter", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }] },
        { ordre: 4, titre: "Hébergement et déploiement", description: "Mettez vos projets en ligne pour qu'ils soient accessibles à tous.", videos: [{ ordre: 1, titre: "Déployer un site statique sur Vercel", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }, { ordre: 2, titre: "Introduction à l'hébergement de serveurs", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }] },
    ],
    'agriculture-intelligente': [
        { ordre: 1, titre: "Introduction à l’agriculture intelligente", description: "Comprendre les enjeux et les technologies de l'agriculture de demain.", videos: [{ ordre: 1, titre: "Les piliers de l'AgriTech", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }] },
        { ordre: 2, titre: "Gestion de l’irrigation et du climat", description: "Optimisez l'utilisation de l'eau et anticipez les conditions météorologiques.", videos: [{ ordre: 1, titre: "Systèmes d'irrigation goutte-à-goutte", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }, { ordre: 2, titre: "Utiliser les données météo pour planifier", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }] },
        { ordre: 3, titre: "Utilisation des capteurs et données", description: "Collectez des données sur vos parcelles pour prendre de meilleures décisions.", videos: [{ ordre: 1, titre: "Introduction aux capteurs d'humidité et de nutriments", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }] },
    ],
     'business-plan': [
        { ordre: 1, titre: "Fondamentaux du Business Plan", description: "Comprendre l'importance et la structure d'un business plan solide.", videos: [{ ordre: 1, titre: "Pourquoi rédiger un business plan ?", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }] },
        { ordre: 2, titre: "Analyse de marché et stratégie", description: "Définir son marché cible et sa proposition de valeur.", videos: [{ ordre: 1, titre: "Réaliser une étude de marché simple", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }] },
        { ordre: 3, titre: "Prévisions financières", description: "Estimer ses revenus, ses coûts et sa rentabilité.", videos: [{ ordre: 1, titre: "Construire son tableau de prévisions financières", url: "https://drive.google.com/drive/folders/placeholder_formafrique" }] },
    ],
};


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
                    description: `Formation sur ${course.titre.toLowerCase()} pour vous aider à maîtriser les compétences clés.`,
                    image: course.image,
                    niveau: 'Débutant' as 'Débutant' | 'Intermédiaire' | 'Avancé',
                    langue: 'Français',
                    prix: 0,
                    publie: true,
                    date_creation: serverTimestamp(),
                    auteur: 'Admin FormaAfrique',
                    instructorId: 'ADMIN_USER_ID', // Replace with a real admin user ID
                    modules: [] // Deprecated, we use subcollection now
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

async function seedModules() {
    const coursesCollectionRef = collection(db, 'courses');
    let formationsMaj = 0;
    let modulesCrees = 0;
    
    console.log("\nStarting to seed modules for existing courses...");

    for (const slug of Object.keys(modulesData)) {
        const q = query(coursesCollectionRef, where("slug", "==", slug));
        const courseSnapshot = await getDocs(q);

        if (courseSnapshot.empty) {
            console.warn(`  - WARNING: Course with slug "${slug}" not found. Skipping module seeding.`);
            continue;
        }

        const courseDoc = courseSnapshot.docs[0];
        const courseId = courseDoc.id;
        const modulesCollectionRef = collection(db, `courses/${courseId}/modules`);

        const existingModulesSnapshot = await getDocs(modulesCollectionRef);
        if (!existingModulesSnapshot.empty) {
            console.log(`  - Modules already exist for "${courseDoc.data().titre}". Skipping.`);
            continue;
        }

        console.log(`  - Adding modules to "${courseDoc.data().titre}"...`);
        const modulesForCourse = modulesData[slug];
        
        for (const module of modulesForCourse) {
             try {
                await addDoc(modulesCollectionRef, module);
                modulesCrees++;
             } catch(error) {
                 console.error(`Error adding module "${module.titre}" to course "${courseDoc.data().titre}"`, error)
             }
        }
        
        formationsMaj++;
        console.log(`    -> Added ${modulesForCourse.length} modules.`);
    }
    
    console.log(`\n✅ Module seeding complete!`);
    console.log(`Total formations updated: ${formationsMaj}`);
    console.log(`Total modules created: ${modulesCrees}`);
}


async function main() {
    await seedCourses();
    await seedModules();
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
