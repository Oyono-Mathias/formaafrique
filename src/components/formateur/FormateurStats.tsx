
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, BookOpen, Users, Wallet } from 'lucide-react';

interface FormateurStatsProps {
  coursesCount: number;
  studentsCount: number;
  totalRevenue: number;
  loading: boolean;
}

/**
 * @component FormateurStats
 * @description Affiche les cartes de statistiques pour le tableau de bord du formateur.
 * @props
 *  - coursesCount: Nombre total de cours.
 *  - studentsCount: Nombre total d'étudiants.
 *  - totalRevenue: Revenu total estimé.
 *  - loading: État de chargement pour afficher un spinner.
 * @ux
 *  - Composant purement visuel, reçoit ses données via les props.
 *  - Affiche des spinners dans les cartes pendant le chargement.
 */
export default function FormateurStats({
  coursesCount,
  studentsCount,
  totalRevenue,
  loading,
}: FormateurStatsProps) {

  const formatCurrency = (amount: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
  }

  const stats = [
    {
      label: 'Cours publiés',
      value: loading ? <Loader2 className="h-5 w-5 animate-spin" /> : coursesCount,
      icon: BookOpen,
      description: 'Nombre de formations visibles par les étudiants.',
    },
    {
      label: 'Étudiants inscrits',
      value: loading ? <Loader2 className="h-5 w-5 animate-spin" /> : studentsCount,
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
