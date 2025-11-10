
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, BookOpen, Users, Wallet, Clock } from 'lucide-react';
import { useUser } from '@/firebase';
import { db } from '@/firebase/config';
import { doc, onSnapshot, query, collection, where } from 'firebase/firestore';
import type { Course } from '@/lib/types';
import StatsChart from './StatsChart';

interface InstructorStatsData {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  totalWatchMinutes: number;
}

const generateMockSeries = (days: number, max: number) => {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i -1) * 24 * 60 * 60 * 1000).toISOString(),
    value: Math.floor(Math.random() * max),
  }));
};

/**
 * @component TrainerStats
 * @description Affiche les statistiques clés pour le formateur en écoutant en temps réel
 * les documents d'agrégation sur Firestore.
 *
 * @props {} - Aucune prop, les données sont récupérées via le hook `useUser`.
 * @hooks
 *  - useUser: Pour obtenir l'ID du formateur authentifié.
 *  - useState: Pour stocker les statistiques, les états de chargement et d'erreur.
 *  - useEffect: Pour mettre en place les listeners Firestore en temps réel.
 * @firestore
 *  - Écoute `formateur_stats/{authorId}` pour les stats agrégées (étudiants, revenus).
 *  - Écoute la collection `formations` (filtrée par `authorId`) pour le nombre de cours.
 * @ux
 *  - Affiche des skeletons de cartes pendant le chargement initial.
 *  - Met à jour les chiffres en temps réel sans rafraîchissement de la page.
 *  - Formate les nombres pour une meilleure lisibilité (devise, heures).
 */
export default function TrainerStats() {
  const { user } = useUser();
  const [stats, setStats] = useState<InstructorStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mock data for charts
  const [enrollmentsSeries] = useState(() => generateMockSeries(30, 20));
  const [revenueSeries] = useState(() => generateMockSeries(30, 5000));


  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const authorId = user.uid;

    // Listener for aggregated stats
    const statsDocRef = doc(db, 'formateur_stats', authorId);
    const unsubscribeStats = onSnapshot(statsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as InstructorStatsData;
        setStats(prev => ({ ...prev, ...data }));
      } else {
         // If doc doesn't exist, initialize with zeros
         setStats(prev => ({ 
             ...prev, 
             totalStudents: 0, 
             totalRevenue: 0, 
             totalWatchMinutes: 0 
         } as InstructorStatsData));
      }
      setError(null);
    }, (err) => {
      console.error("Error fetching instructor stats:", err);
      setError("Impossible de charger les statistiques.");
      setLoading(false);
    });

    // Listener for courses count
    const coursesQuery = query(collection(db, 'formations'), where('authorId', '==', authorId));
    const unsubscribeCourses = onSnapshot(coursesQuery, (querySnap) => {
      setStats(prev => ({ ...prev, totalCourses: querySnap.size } as InstructorStatsData));
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching courses:", err);
      setError("Impossible de charger le nombre de cours.");
      setLoading(false);
    });


    // Cleanup listeners on unmount
    return () => {
      unsubscribeStats();
      unsubscribeCourses();
    };
  }, [user?.uid]);

  const formatCurrency = (amount: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
  };

  const formatWatchHours = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = minutes / 60;
    return `${hours.toFixed(1)} heures`;
  };

  const statCards = [
    {
      label: 'Cours créés',
      value: stats?.totalCourses ?? 0,
      icon: BookOpen,
      description: 'Nombre total de vos formations.',
      series: null,
    },
    {
      label: 'Étudiants inscrits',
      value: stats?.totalStudents ?? 0,
      icon: Users,
      description: "Nombre total d'étudiants uniques.",
      series: enrollmentsSeries,
    },
    {
      label: 'Revenus Totaux (Est.)',
      value: formatCurrency(stats?.totalRevenue ?? 0),
      icon: Wallet,
      description: 'Gains générés par vos ventes.',
      series: revenueSeries,
    },
    {
      label: 'Heures de visionnage',
      value: formatWatchHours(stats?.totalWatchMinutes ?? 0),
      icon: Clock,
      description: 'Temps total passé sur vos vidéos.',
      series: null,
    },
  ];

  if (loading) {
      return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="h-40 animate-pulse">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                    </CardHeader>
                    <CardContent>
                        <div className='h-8 bg-gray-200 rounded w-1/3 mt-2'></div>
                        <div className='h-12 bg-gray-200 rounded w-full mt-4'></div>
                    </CardContent>
                </Card>
              ))}
          </div>
      )
  }

  if (error) {
      return <div className="text-destructive text-center py-8">{error}</div>
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" aria-label="Statistiques du formateur">
      {statCards.map((stat) => (
        <Card key={stat.label} className="rounded-2xl shadow-sm transition-all hover:shadow-md flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent className="flex flex-col flex-grow justify-between">
            <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
            {stat.series && (
              <div className="mt-4">
                <StatsChart series={stat.series} label={`Graphique de ${stat.label.toLowerCase()}`} />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
