'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  BookCopy,
  DollarSign,
  GraduationCap,
  Users,
} from 'lucide-react';
import { courses, users } from '@/lib/mock-data';

export default function AdminDashboardPage() {
  const stats = [
    {
      label: 'Utilisateurs',
      value: users.length,
      icon: Users,
      description: 'Nombre total d\'utilisateurs inscrits.',
    },
    {
      label: 'Formations',
      value: courses.length,
      icon: BookCopy,
      description: 'Nombre total de formations disponibles.',
    },
    {
      label: 'Certificats Délivrés',
      value: 1, // Mock data
      icon: GraduationCap,
      description: 'Basé sur les formations terminées.',
    },
    {
      label: 'Dons Totals',
      value: '150 €', // Mock data
      icon: DollarSign,
      description: 'Montant total des contributions.',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Tableau de Bord Administrateur</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de l'activité sur FormaAfrique.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
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
      
      <div className='grid lg:grid-cols-2 gap-6'>
         <Card>
            <CardHeader>
              <CardTitle>Aperçu des inscriptions</CardTitle>
            </CardHeader>
            <CardContent>
               <p className='text-muted-foreground'>Graphique à venir...</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Dernières activités</CardTitle>
            </CardHeader>
            <CardContent>
               <p className='text-muted-foreground'>Journal d'activité à venir...</p>
            </CardContent>
          </Card>
      </div>

    </div>
  );
}
