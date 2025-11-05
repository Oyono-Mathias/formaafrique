'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import type { Course, Enrollment, UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Timestamp, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

interface EnrichedEnrollment extends Enrollment {
  studentEmail?: string;
}

export default function FormateurStudentsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: courses, loading: coursesLoading } = useCollection<Course>('courses', {
    where: user?.uid ? ['instructorId', '==', user.uid] : undefined,
  });

  const [enrollments, setEnrollments] = useState<EnrichedEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!db || !courses || courses.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const allEnrollments: EnrichedEnrollment[] = [];
        const userProfilesCache = new Map<string, UserProfile>();

        for (const course of courses) {
          if (course.id) {
            const enrollmentsCollectionRef = collection(db, 'courses', course.id, 'enrollments');
            const enrollmentsSnapshot = await getDocs(enrollmentsCollectionRef);
            
            for (const enrollmentDoc of enrollmentsSnapshot.docs) {
              const enrollmentData = { id: enrollmentDoc.id, ...enrollmentDoc.data() } as Enrollment;

              let studentEmail = 'N/A';
              if (userProfilesCache.has(enrollmentData.studentId)) {
                studentEmail = userProfilesCache.get(enrollmentData.studentId)?.email || 'N/A';
              } else {
                const userDocRef = doc(db, 'users', enrollmentData.studentId);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                  const userData = userDocSnap.data() as UserProfile;
                  studentEmail = userData.email;
                  userProfilesCache.set(enrollmentData.studentId, userData);
                }
              }

              allEnrollments.push({
                  ...enrollmentData,
                  studentEmail: studentEmail,
              });
            }
          }
        }
        
        // Sort enrollments by date
        allEnrollments.sort((a,b) => {
            const dateA = a.enrollmentDate instanceof Timestamp ? a.enrollmentDate.toMillis() : 0;
            const dateB = b.enrollmentDate instanceof Timestamp ? b.enrollmentDate.toMillis() : 0;
            return dateB - dateA;
        });

        setEnrollments(allEnrollments);
      } catch (err) {
        console.error("Error fetching enrollments:", err);
        setError("Impossible de charger la liste des étudiants.");
      } finally {
        setLoading(false);
      }
    };

    if (!coursesLoading) {
      fetchEnrollments();
    }
  }, [db, courses, coursesLoading]);
  
  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Mes Étudiants</h1>
        <p className="text-muted-foreground">
          Consultez la liste des étudiants inscrits à vos formations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Inscriptions</CardTitle>
          <CardDescription>
            Voici tous les étudiants qui ont rejoint vos cours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(loading || coursesLoading) ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-2">Chargement des étudiants...</p>
            </div>
          ) : error ? (
            <div className="text-destructive text-center py-12">{error}</div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucun étudiant n'est inscrit à vos formations pour le moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom de l'étudiant</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead>Formation</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Date d'inscription</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">{enrollment.studentName}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{enrollment.studentEmail}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{enrollment.courseTitle}</Badge>
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell text-sm text-muted-foreground">
                        {enrollment.enrollmentDate ? formatDate(enrollment.enrollmentDate) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
