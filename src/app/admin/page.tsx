'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Activity,
  BookCopy,
  CreditCard,
  DollarSign,
  Download,
  GraduationCap,
  Users,
} from 'lucide-react';
import { useCollection } from '@/firebase';
import type { Course, UserProfile } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SecurityBanner from '@/components/SecurityBanner';

export default function AdminDashboardPage() {
  const { data: usersData, loading: usersLoading } = useCollection<UserProfile>('users');
  const { data: coursesData, loading: coursesLoading } = useCollection<Course>('courses');

  const users = usersData || [];
  const courses = coursesData || [];

  const stats = [
    {
      label: 'Utilisateurs Inscrits',
      value: usersLoading ? '...' : users.length,
      icon: Users,
      description: "Nombre total d'utilisateurs.",
    },
    {
      label: 'Formations Disponibles',
      value: coursesLoading ? '...' : courses.length,
      icon: BookCopy,
      description: 'Nombre total de cours.',
    },
    {
      label: 'Revenus Mensuels',
      value: '150 €', // Mock data
      icon: DollarSign,
      description: '+15% ce mois-ci',
    },
    {
      label: 'Taux d\'Activité',
      value: '82%', // Mock data
      icon: Activity,
      description: 'Utilisateurs actifs cette semaine.',
    },
  ];

  return (
    <div className="space-y-8">
      <SecurityBanner />
      <div>
        <h1 className="text-3xl font-bold font-headline">Tableau de Bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de l'activité sur FormaAfrique.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
      
      <div className='grid lg:grid-cols-2 gap-6'>
         <Card className="rounded-2xl shadow-md">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Transactions Récentes</CardTitle>
                <CardDescription>Les 5 derniers dons et paiements.</CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <a href="#">
                  Tout voir
                  <CreditCard className="h-4 w-4" />
                </a>
              </Button>
            </CardHeader>
            <CardContent>
               <p className='text-muted-foreground'>Journal des transactions à venir...</p>
            </CardContent>
          </Card>
           <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle>Inscriptions Récentes</CardTitle>
              <CardDescription>Les 5 derniers utilisateurs inscrits.</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="text-right">Rôle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(users || []).slice(0, 5).map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                      <TableCell className="text-right"><Badge variant="outline">{user.role}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      </div>

    </div>
  );
}
