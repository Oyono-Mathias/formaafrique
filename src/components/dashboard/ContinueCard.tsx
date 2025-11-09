'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useDoc } from '@/firebase';
import type { Course, Enrollment, Video } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlayCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

/**
 * @component ContinueCard
 * Affiche la dernière formation consultée par l'étudiant et lui permet de la reprendre.
 * Écoute en temps réel les changements dans la progression de l'utilisateur.
 */
export default function ContinueCard() {
  const { user } = useUser();
  // Note: This assumes we store the ID of the last accessed course somewhere, e.g., in the user's profile.
  // For now, we'll just pick the first enrolled course as an example.
  const { data: enrollments, loading: enrollmentsLoading } = useUser();
  const lastCourseId = enrollments?.[0]?.id; // Simplified logic

  const { data: enrollment, loading: enrollmentLoading } = useDoc<Enrollment>(
    user && lastCourseId ? `users/${user.uid}/enrollments` : null,
    lastCourseId
  );

  const loading = enrollmentsLoading || enrollmentLoading;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Continuer d'apprendre</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-24">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!enrollment) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Commencez votre parcours</CardTitle>
                <CardDescription>Inscrivez-vous à votre première formation.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild><Link href="/courses">Explorer les formations</Link></Button>
            </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle>Reprendre : {enrollment.courseTitle}</CardTitle>
        <CardDescription>Vous étiez sur le point de commencer une nouvelle leçon.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild size="lg" className="w-full">
          <Link href={`/courses/${enrollment.courseId}`}>
            <PlayCircle className="mr-2 h-5 w-5" />
            Continuer la formation
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
