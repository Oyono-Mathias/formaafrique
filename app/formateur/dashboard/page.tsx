
"use client";
import React from "react";
import TrainerStats from "@/components/TrainerStats";

/**
 * @page Dashboard Formateur (Page Principale)
 * @description Page d'accueil pour le formateur, affichant des statistiques clés (revenus, étudiants)
 * et des raccourcis vers les actions principales.
 *
 * @props {} - Pas de props directs, les données sont récupérées via des hooks.
 * @hooks
 *  - useUser: Pour récupérer l'ID du formateur connecté.
 *  - useCollection: Pour récupérer les cours et les données nécessaires aux statistiques.
 * @firestore
 *  - Écoute la collection `courses` filtrée par `authorId` pour le compte total.
 *  - Écoute les sous-collections `enrollments` pour agréger le nombre d'étudiants.
 *  - Écoute les `donations` liées à ses cours.
 * @ux
 *  - Affiche des cartes de statistiques claires et percutantes.
 *  - Propose des liens d'action rapide comme "Créer un nouveau cours".
 *  - Affiche un état de chargement pendant la récupération des données.
 */
export default function DashboardFormateur() {
  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord Formateur</h1>
      <TrainerStats />
      {/* D'autres composants comme la liste des derniers étudiants, etc. pourront être ajoutés ici */}
    </main>
  );
}
