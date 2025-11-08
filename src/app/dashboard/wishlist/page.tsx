
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useFirestore, useCollection } from '@/firebase';
import type { Course } from '@/lib/types';
import { Loader2, Heart, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface WishlistItem {
  id: string;
  userId: string;
  courseId: string;
  createdAt: any;
}

interface EnrichedWishlistItem extends Course {
  wishlistId: string;
}

export default function WishlistPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const collectionOptions = useMemo(() => {
    if (!user?.uid) return undefined;
    return { where: ['userId', '==', user.uid] as [string, '==', string] };
  }, [user?.uid]);
  
  const { data: wishlistItems, loading: wishlistLoading, error: wishlistError } = useCollection<WishlistItem>(
    user?.uid ? 'wishlist' : null,
    collectionOptions
  );

  const [enrichedWishlist, setEnrichedWishlist] = useState<EnrichedWishlistItem[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    if (!wishlistItems || !db) {
        setCoursesLoading(false);
        return;
    };

    const fetchCourseDetails = async () => {
      setCoursesLoading(true);
      const coursePromises = wishlistItems.map(async (item) => {
        const courseDocRef = doc(db, 'courses', item.courseId);
        const courseSnap = await getDoc(courseDocRef);
        if (courseSnap.exists()) {
          return { ...courseSnap.data(), id: courseSnap.id, wishlistId: item.id } as EnrichedWishlistItem;
        }
        return null;
      });

      const courses = (await Promise.all(coursePromises)).filter((c): c is EnrichedWishlistItem => c !== null);
      setEnrichedWishlist(courses);
      setCoursesLoading(false);
    };

    if (wishlistItems.length > 0) {
      fetchCourseDetails();
    } else {
      setEnrichedWishlist([]);
      setCoursesLoading(false);
    }
  }, [wishlistItems, db]);

  const handleRemove = async (wishlistId: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'wishlist', wishlistId));
      toast({
        title: "Retiré des souhaits",
        description: "La formation a été retirée de votre liste.",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible de retirer la formation de vos souhaits."
      })
    }
  }

  const loading = wishlistLoading || coursesLoading;
  const error = wishlistError;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Ma Liste de Souhaits</h1>
          <p className="text-muted-foreground">
            Les formations que vous avez sauvegardées pour plus tard.
          </p>
        </div>
        <Button asChild>
          <Link href="/courses">Explorer de nouvelles formations</Link>
        </Button>
      </div>

       {loading && (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-4">Chargement de votre liste...</p>
          </div>
       )}
       {error && <p className="text-destructive text-center py-12">Erreur de chargement de la liste de souhaits.</p>}

       {!loading && !error && (
            enrichedWishlist.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {enrichedWishlist.map(course => {
                        const courseImage = PlaceHolderImages.find(img => img.id === course.image);
                        return (
                             <Card key={course.wishlistId} className="flex flex-col overflow-hidden shadow-sm">
                                <Link href={`/courses/${course.id}`} className="block aspect-video relative bg-muted">
                                    {courseImage && (
                                        <Image
                                            src={courseImage.imageUrl}
                                            alt={course.titre}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </Link>
                                <CardContent className="p-4 flex flex-col flex-grow">
                                    <h3 className="font-bold text-lg leading-tight flex-grow hover:text-primary">
                                        <Link href={`/courses/${course.id}`}>{course.titre}</Link>
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">{course.auteur}</p>
                                    <div className="flex justify-between items-center mt-4">
                                        <div className="font-bold text-lg">
                                            {course.prix === 0 ? "Gratuit" : `${course.prix.toLocaleString('fr-FR')} XAF`}
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemove(course.wishlistId)}>
                                            <Trash2 className="h-5 w-5 text-destructive" />
                                            <span className="sr-only">Supprimer</span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-20 border-2 border-dashed rounded-lg flex flex-col items-center">
                    <Heart className="h-12 w-12 mb-4" />
                    <h3 className="text-xl font-semibold text-foreground">Votre liste de souhaits est vide</h3>
                    <p className="mt-2 max-w-sm">Parcourez nos formations et ajoutez celles qui vous intéressent en cliquant sur l'icône en forme de cœur.</p>
                    <Button asChild className="mt-6">
                        <Link href="/courses">Trouver une formation</Link>
                    </Button>
                </div>
            )
       )}

    </div>
  );
}
