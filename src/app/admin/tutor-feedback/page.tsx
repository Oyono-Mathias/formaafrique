'use client';

import React from 'react';
import { useCollection, useFirestore } from '@/firebase';
import type { TutorFeedback } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function AdminTutorFeedbackPage() {
  const { data: feedbacks, loading, error } = useCollection<TutorFeedback>('tutorFeedbacks', {
      orderBy: ['createdAt', 'desc'],
  });
  const db = useFirestore();
  const { toast } = useToast();

  const handleResolve = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'tutorFeedbacks', id));
      toast({ title: "Feedback marqué comme résolu." });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: "Erreur lors de la résolution." });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Feedback du Tuteur IA</h1>
        <p className="text-muted-foreground">
          Examinez les retours des utilisateurs sur les réponses du tuteur IA pour l'améliorer.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Retours Négatifs des Utilisateurs</CardTitle>
          <CardDescription>
            Les utilisateurs ont signalé que ces réponses n'étaient pas utiles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-12">Erreur de chargement des feedbacks.</div>
          ) : !feedbacks || feedbacks.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
                <ThumbsUp className="mx-auto h-12 w-12 text-green-500" />
                <p className="mt-4 font-semibold">Aucun feedback négatif pour le moment !</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requête de l'utilisateur</TableHead>
                  <TableHead>Réponse de l'IA</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((fb) => (
                  <TableRow key={fb.id}>
                    <TableCell className="max-w-xs italic">"{fb.query}"</TableCell>
                    <TableCell className="max-w-sm">
                        <p className='line-clamp-3'>{fb.answer}</p>
                    </TableCell>
                    <TableCell>
                      {fb.createdAt ? formatDistanceToNow(fb.createdAt.toDate(), { addSuffix: true, locale: fr }) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                       <Button size="sm" onClick={() => handleResolve(fb.id!)}>
                            Marquer comme résolu
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
