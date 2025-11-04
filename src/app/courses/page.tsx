
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ListFilter, Search, Users, Loader2 } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Course } from '@/lib/types';
import { useCollection } from '@/firebase';
import { categories } from '@/lib/categories';
import { Timestamp } from 'firebase/firestore';

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const { data: courses, loading, error } = useCollection<Course>('courses', {
      where: ['publie', '==', true]
  });

  const sortedCourses = useMemo(() => {
    if (!courses) return [];
    return [...courses].sort((a, b) => {
        const dateA = a.date_creation instanceof Timestamp ? a.date_creation.toMillis() : new Date(a.date_creation as string).getTime();
        const dateB = b.date_creation instanceof Timestamp ? b.date_creation.toMillis() : new Date(b.date_creation as string).getTime();
        return dateB - dateA;
    });
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return sortedCourses
      .filter(course => 
        search === '' || course.titre.toLowerCase().includes(search.toLowerCase())
      )
      .filter(course =>
        category === 'all' || course.categorie === category
      );
  }, [search, category, sortedCourses]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Chargement des formations...</p>
      </div>
    );
  }

  if (error) {
      return <div className="text-center py-12 text-destructive">Erreur de chargement des formations.</div>
  }


  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="space-y-4 mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl font-headline">
          Toutes nos formations
        </h1>
        <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
          Explorez notre catalogue complet et trouvez le cours qui correspond à vos ambitions.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Rechercher une formation..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <ListFilter className="mr-2 h-4 w-4" />
              Filtrer par catégorie
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Catégories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={category} onValueChange={(value) => setCategory(value)}>
              <DropdownMenuRadioItem value="all">Toutes</DropdownMenuRadioItem>
              {categories.map(cat => (
                 <DropdownMenuRadioItem key={cat} value={cat}>{cat}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredCourses.map((course) => {
          const courseImage = PlaceHolderImages.find((img) => img.id === course.image);
          return (
            <Card key={course.id} className="flex flex-col overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader className="p-0">
                <Link href={`/courses/${course.id}`} className="block aspect-video relative">
                  {courseImage && (
                    <Image
                      src={courseImage.imageUrl}
                      alt={course.titre}
                      fill
                      className="object-cover"
                      data-ai-hint={courseImage.imageHint}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}
                </Link>
              </CardHeader>
              <CardContent className="flex-grow p-6">
                <Badge variant="secondary" className="mb-2">{course.categorie}</Badge>
                <CardTitle className="text-xl font-headline leading-tight hover:text-primary">
                  <Link href={`/courses/${course.id}`}>{course.titre}</Link>
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex justify-between items-center">
                 <Button asChild variant="link" size="sm">
                  <Link href={`/courses/${course.id}`}>Voir les détails <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
              <p>Aucune formation ne correspond à vos critères.</p>
          </div>
      )}
    </div>
  );
}

