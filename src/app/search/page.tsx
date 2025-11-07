'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowRight, Loader2, BookOpen } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { useCollection } from '@/firebase';
import type { Course } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: courses, loading, error } = useCollection<Course>('courses', {
    where: ['publie', '==', true]
  });

  const filteredCourses = useMemo(() => {
    if (!searchTerm) {
      return [];
    }
    return (courses || []).filter(course => 
      course.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.auteur.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, courses]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Rechercher des formations, auteurs, compétences..."
          className="pl-10 h-12 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && searchTerm && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Recherche en cours...</span>
        </div>
      )}

      {error && <p className="text-center text-destructive">Erreur lors de la recherche.</p>}

      {!loading && searchTerm && filteredCourses.length > 0 && (
         <div className="space-y-4">
            <h2 className="text-xl font-bold">
              {filteredCourses.length} résultat{filteredCourses.length > 1 ? 's' : ''} pour "{searchTerm}"
            </h2>
            {filteredCourses.map(course => {
                const courseImage = PlaceHolderImages.find((img) => img.id === course.image);
                return (
                    <Link key={course.id} href={`/courses/${course.id}`} className="block">
                         <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg hover:bg-muted transition-colors border">
                             <div className="w-full sm:w-48 sm:flex-shrink-0">
                                <div className="aspect-video relative bg-muted rounded-md overflow-hidden">
                                     {courseImage && (
                                        <Image
                                            src={courseImage.imageUrl}
                                            alt={course.titre}
                                            fill
                                            className="object-cover"
                                        />
                                     )}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-lg font-bold">{course.titre}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                                <div className="text-xs text-muted-foreground mt-2">Par {course.auteur}</div>
                                <div className="mt-2 flex items-center gap-2">
                                    <Badge variant="secondary">{course.categorie}</Badge>
                                    <Badge variant="outline">{course.niveau}</Badge>
                                </div>
                            </div>
                         </div>
                    </Link>
                )
            })}
         </div>
      )}

       {!loading && searchTerm && filteredCourses.length === 0 && (
         <div className="text-center py-16">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Aucun résultat pour "{searchTerm}"</h3>
            <p className="mt-2 text-sm text-muted-foreground">Essayez avec d'autres mots-clés.</p>
         </div>
       )}

      {!searchTerm && (
        <div className="text-center py-16">
            <h2 className="text-2xl font-bold">Commencez à chercher</h2>
            <p className="mt-2 text-muted-foreground">Entrez un terme dans la barre de recherche pour trouver la formation parfaite.</p>
        </div>
      )}

    </div>
  );
}
