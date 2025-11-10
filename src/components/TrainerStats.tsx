
"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@/firebase';

/**
 * @component TrainerStats
 * @description Affiche les statistiques clés pour le formateur (revenus, nombre d'étudiants, etc.).
 *
 * @props {} - Aucune prop, les données sont récupérées en interne.
 * @hooks
 *  - useUser: Pour obtenir l'ID du formateur.
 *  - useState: Pour stocker les statistiques agrégées.
 *  - useEffect: Pour lancer l'agrégation des données.
 * @firestore
 *  - Lit la collection `courses` où `authorId` est l'UID du formateur.
 *  - Pour chaque cours, pourrait potentiellement écouter les sous-collections `enrollments` et `donations`
 *    pour calculer les totaux. Idéalement, ces totaux seraient agrégés par une Cloud Function.
 * @ux
 *  - Affiche des cartes avec des chiffres clés.
 *  - Affiche un état de chargement pour chaque statistique.
 */
export default function TrainerStats() {
  const { user } = useUser();
  const [stats, setStats] = useState({ totalStudents: 0, totalRevenue: 0, courseCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Pseudo-code pour la récupération des données
    const fetchStats = async () => {
      setLoading(true);
      // const courses = await getDocs(query(collection(db, 'courses'), where('authorId', '==', user.uid)));
      // let students = 0;
      // for (const course of courses.docs) {
      //   const enrollments = await getCountFromServer(collection(db, `courses/${course.id}/enrollments`));
      //   students += enrollments.data().count;
      // }
      // setStats({ totalStudents: students, ... });
      setLoading(false);
    };

    fetchStats();
  }, [user]);

  return (
    <div className="bg-white shadow-md rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">Statistiques du Formateur</h2>
      {loading ? (
        <p>Chargement des statistiques...</p>
      ) : (
        <p>Statistiques formateur à venir...</p>
        // <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        //   <div className="p-4 border rounded-lg">
        //     <h3 className="text-muted-foreground">Étudiants</h3>
        //     <p className="text-2xl font-bold">{stats.totalStudents}</p>
        //   </div>
        //   {/* Autres cartes de statistiques */}
        // </div>
      )}
    </div>
  );
}
