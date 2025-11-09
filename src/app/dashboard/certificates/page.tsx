
'use client';

import Link from 'next/link';
import { Download, Eye, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUser, useCollection } from '@/firebase';
import type { Enrollment } from '@/lib/types';
import { useMemo } from 'react';
import { Timestamp } from 'firebase/firestore';

export default function MyCertificatesPage() {
  const { user } = useUser();
  const { data: enrollments, loading, error } = useCollection<Enrollment>(
    user ? `users/${user.uid}/enrollments` : undefined
  );

  const completedCourses = useMemo(() => {
    return (enrollments || []).filter(e => (e.progression || 0) >= 100);
  }, [enrollments]);

  const formatDate = (date: any) => {
    if (!date) return '-';
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className='ml-2'>Chargement de vos certificats...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive text-center py-12">❌ Impossible de charger vos certificats.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Mes Certificats</h1>
        <p className="text-muted-foreground">
          Vos réalisations et certificats de fin de formation.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Formation</TableHead>
                <TableHead className="hidden sm:table-cell">Date d'obtention</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedCourses.length > 0 ? (
                completedCourses.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">{enrollment.courseTitle}</TableCell>
                    <TableCell className="hidden sm:table-cell">{formatDate(enrollment.enrollmentDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/certificate/${enrollment.courseId}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    Vous n'avez aucun certificat pour le moment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

