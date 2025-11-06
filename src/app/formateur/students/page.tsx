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
import { Timestamp, collection, getDocs, doc, getDoc, onSnapshot, query, Unsubscribe } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';

interface EnrichedEnrollment extends Enrollment {
  studentEmail?: string;
  studentName: string;
}

export default function FormateurStudentsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: coursesData, loading: coursesLoading } = useCollection<Course>('courses', {
    where: user?.uid ? ['instructorId', '==', user.uid] : undefined,
  });
  const courses = coursesData || [];

  const [enrollments, setEnrollments] = useState<EnrichedEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || coursesLoading) return;
    
    if (!user || courses.length === 0) {
        setLoading(false);
        setEnrollments([]);
        return;
    }

    const unsubscribes: Unsubscribe[] = [];
    const userProfilesCache = new Map<string, UserProfile>();

    courses.forEach(course => {
        if (course.id) {
            const enrollmentsQuery = query(collection(db, `courses/${course.id}/enrollments`));
            
            const unsubscribe = onSnapshot(enrollmentsQuery, async (snapshot) => {
                const fetchedEnrollments: EnrichedEnrollment[] = [];

                for (const enrollmentDoc of snapshot.docs) {
                    const enrollmentData = { id: enrollmentDoc.id, ...enrollmentDoc.data() } as Enrollment;

                    let studentProfile = userProfilesCache.get(enrollmentData.studentId);

                    if (!studentProfile) {
                        const userDocRef = doc(db, 'users', enrollmentData.studentId);
                        const userDocSnap = await getDoc(userDocRef);
                        if (userDocSnap.exists()) {
                            studentProfile = userDocSnap.data() as UserProfile;
                            userProfilesCache.set(enrollmentData.studentId, studentProfile);
                        }
                    }

                    fetchedEnrollments.push({
                        ...enrollmentData,
                        studentName: studentProfile?.name || enrollmentData.studentName || 'Étudiant inconnu',
                        studentEmail: studentProfile?.email || 'Email inconnu',
                    });
                }
                
                // Update state with all enrollments from all courses
                setEnrollments(prev => {
                    const otherCourseEnrollments = prev.filter(e => e.courseId !== course.id);
                    const newEnrollments = [...otherCourseEnrollments, ...fetchedEnrollments];
                    newEnrollments.sort((a,b) => {
                        const dateA = a.enrollmentDate instanceof Timestamp ? a.enrollmentDate.toMillis() : 0;
                        const dateB = b.enrollmentDate instanceof Timestamp ? b.enrollmentDate.toMillis() : 0;
                        return dateB - dateA;
                    });
                    return newEnrollments;
                });

                setLoading(false);

            }, (err) => {
                console.error("Error with snapshot listener:", err);
                setError("Impossible de charger les étudiants en temps réel.");
                setLoading(false);
            });
            
            unsubscribes.push(unsubscribe);
        }
    });

    return () => {
        unsubscribes.forEach(unsub => unsub());
    }

  }, [db, courses, coursesLoading, user]);
  
  const formatDate = (date: any) => {
    if (!date) return '-';
    const d = date instanceof Timestamp ? date.toDate() : date;
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  const getStatus = (enrollment: Enrollment) => {
      if(enrollment.progression === 100) return "Terminé";
      return enrollment.statut || "En cours";
  }

  const getStatusVariant = (enrollment: Enrollment) => {
      const status = getStatus(enrollment);
      if(status === 'Terminé') return 'default';
      return 'secondary';
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Mes Étudiants</h1>
        <p className="text-muted-foreground">
          Suivez la progression des étudiants inscrits à vos formations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Inscriptions</CardTitle>
          <CardDescription>
            Voici tous les étudiants qui ont rejoint vos cours et leur avancement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(loading || coursesLoading) ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-2">Chargement en cours...</p>
            </div>
          ) : error ? (
            <div className="text-destructive text-center py-12">{error}</div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucun étudiant inscrit pour l'instant.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Étudiant</TableHead>
                    <TableHead className="hidden md:table-cell">Formation</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead className="text-right">Date d'inscription</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                          <div className="font-medium">{enrollment.studentName}</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">{enrollment.studentEmail}</div>
                      </TableCell>
                       <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{enrollment.courseTitle}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                           <Progress value={enrollment.progression || 0} className="w-[100px]" />
                           <span className='text-xs font-semibold text-muted-foreground'>{enrollment.progression || 0}%</span>
                           <Badge variant={getStatusVariant(enrollment)} className="hidden lg:inline-flex">
                               {getStatus(enrollment)}
                            </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDate(enrollment.enrollmentDate)}
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
