'use client';

import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection } from '@/firebase';
import type { Course } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface CoursesCarouselProps {
  title: string;
  // In a real app, you'd pass query options here to fetch specific courses
  // e.g., { where: ['category', '==', 'Compétences numériques'] }
}

/**
 * @component CoursesCarousel
 * Affiche une liste de formations dans un carrousel interactif.
 */
export default function CoursesCarousel({ title }: CoursesCarouselProps) {
  const { data: courses, loading, error } = useCollection<Course>('courses');

  if (loading) {
    return (
      <div className="flex items-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Chargement des recommandations...
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">Erreur de chargement des cours.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {(courses || []).map((course) => (
            <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Link href={`/courses/${course.id}`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-base truncate">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">{course.summary}</p>
                    </CardContent>
                    </Card>
                </Link>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
}
