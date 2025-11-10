
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, BookOpen, Users, Wallet } from 'lucide-react';
import { collection, query, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Course } from '@/lib/types';

interface FormateurStatsProps {
  courses: Course[];
  loading: boolean;
}

/**
 * @component FormateurStats
 * @description Affiche les cartes de statistiques pour le tableau de bord du formateur.
 * @props
 *  - courses: La liste des cours du formateur.
 *  - loading: État de chargement global pour afficher un spinner.
 */
export default function FormateurStats({
  courses,
  loading: initialLoading,
}: FormateurStatsProps) {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);

  useEffect(() => {
    if (initialLoading) return;
    if (!courses || courses.length === 0) {
      setEnrollmentsLoading(false);
      setTotalStudents(0);
      setTotalRevenue(0);
      return;
    }

    const listeners: Unsubscribe[] = [];
    const enrollmentsByCourse: { [courseId: string]: number } = {};
    const revenueByCourse: { [courseId: string]: number } = {};

    let coursesProcessed = 0;

    courses.forEach(course => {
      if (!course.id) {
          coursesProcessed++;
          return;
      };

      const enrollmentsQuery = query(collection(db, `formations/${course.id}/enrollments`));
      
      const unsubscribe = onSnapshot(enrollmentsQuery, (snapshot) => {
        enrollmentsByCourse[course.id!] = snapshot.size;
        revenueByCourse[course.id!] = snapshot.size * (course.price || 0);

        setTotalStudents(Object.values(enrollmentsByCourse).reduce((a, b) => a + b, 0));
        setTotalRevenue(Object.values(revenueByCourse).reduce((a, b) => a + b, 0));

      }, (error) => {
          console.error(`Error fetching enrollments for course ${course.id}:`, error);
      });

      listeners.push(unsubscribe);
      coursesProcessed++;
    });

    if(coursesProcessed === courses.length) {
        setEnrollmentsLoading(false);
    }

    return () => {
      listeners.forEach(unsub => unsub());
    };
  }, [courses, initialLoading]);

  const formatCurrency = (amount: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
  }

  const loading = initialLoading || enrollmentsLoading;

  const stats = [
    {
      label: 'Cours créés',
      value: initialLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : courses.length,
      icon: BookOpen,
      description: 'Nombre total de vos formations.',
    },
    {
      label: 'Étudiants inscrits',
      value: loading ? <Loader2 className="h-5 w-5 animate-spin" /> : totalStudents,
      icon: Users,
      description: "Nombre total d'étudiants dans vos cours.",
    },
    {
      label: 'Revenus Totaux (Est.)',
      value: loading ? <Loader2 className="h-5 w-5 animate-spin" /> : formatCurrency(totalRevenue),
      icon: Wallet,
      description: 'Revenus générés par vos formations.',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="rounded-2xl shadow-md transition-transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
