
// src/scripts/seed-accounting-course.ts

import { collection, addDoc, getDocs, query, where, serverTimestamp, getFirestore, writeBatch } from 'firebase/firestore';
import { initializeApp, getApp, getApps } from 'firebase/app';

// This script is intended to be run from a Node.js environment.
// Ensure you have firebase config in your environment variables.

console.log("--- Starting Accounting Course Seeding Script ---");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

if (!firebaseConfig.projectId) {
    console.error("Firebase project ID is not configured. Halting script.");
    process.exit(1);
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

console.log(`Firebase Initialized for project: ${firebaseConfig.projectId}`);

const slugify = (text: string) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

const courseData = {
    titre: 'Les bases de la comptabilité',
    categorie: 'Finances & Inclusion économique',
    description: 'Apprenez les principes fondamentaux de la comptabilité, y compris comment lire et créer un bilan financier. Idéal pour les entrepreneurs et les étudiants.',
    image: 'course-project-management', // Using a relevant fallback image
    niveau: 'Débutant' as const,
    langue: 'Français',
    prix: 0,
    publie: true,
    auteur: 'Admin FormaAfrique',
    instructorId: 'ADMIN_USER_ID', // Replace with a real Admin user ID if necessary
    statut: 'approuvee' as const,
};

const moduleData = {
    titre: 'Introduction au Bilan',
    description: 'Ce module couvre les concepts essentiels du bilan comptable.',
    ordre: 1,
};

const videoData = {
    titre: 'Les bases de la comptabilité : Le bilan',
    url: 'https://www.youtube.com/watch?v=LqLy6Lsa1F8',
    ordre: 1,
    publie: true, // Let's publish it by default for this example
};


async function seedAccountingCourse() {
    const coursesCollectionRef = collection(db, 'courses');
    const slug = slugify(courseData.titre);
    const q = query(coursesCollectionRef, where("slug", "==", slug));
    
    console.log(`Checking if course "${courseData.titre}" exists...`);
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        console.log(`Course "${courseData.titre}" already exists. Skipping.`);
        return;
    }

    console.log(`Course does not exist. Creating it...`);

    try {
        // 1. Create the Course
        const courseDocRef = await addDoc(coursesCollectionRef, {
            ...courseData,
            slug: slug,
            date_creation: serverTimestamp(),
        });
        console.log(` -> Course created with ID: ${courseDocRef.id}`);

        // 2. Create the Module within the Course
        const moduleCollectionRef = collection(db, `courses/${courseDocRef.id}/modules`);
        const moduleDocRef = await addDoc(moduleCollectionRef, moduleData);
        console.log(` -> Module "${moduleData.titre}" created with ID: ${moduleDocRef.id}`);
        
        // 3. Create the Video within the Module
        const videoCollectionRef = collection(db, `courses/${courseDocRef.id}/modules/${moduleDocRef.id}/videos`);
        await addDoc(videoCollectionRef, videoData);
        console.log(` -> Video "${videoData.titre}" added to module.`);

        console.log("\n✅ Successfully seeded accounting course!");

    } catch (error) {
        console.error("❌ An error occurred during seeding:", error);
    }
}


// Check if running in a Node.js environment
if (typeof process !== 'undefined') {
    seedAccountingCourse().then(() => {
        console.log("\n--- Seeding process finished. ---");
        process.exit(0);
    }).catch(e => {
        console.error("Seeding failed with an unhandled error:", e);
        process.exit(1);
    });
} else {
    console.warn("This script is intended to be run in a Node.js environment, not in the browser.");
}
