'use client';

import { useCollection } from '@/firebase';
import type { InstructorProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export default function InstructorsPage() {
    const { data: instructorsData, loading, error } = useCollection<InstructorProfile>('instructors');
    const instructors = instructorsData || [];

    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="space-y-4 mb-12 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl font-headline">
                    Nos Formateurs Experts
                </h1>
                <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
                    Apprenez auprès des meilleurs professionnels et universitaires du continent, passionnés par le partage de leur savoir.
                </p>
            </div>

            {loading && (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="ml-4">Chargement des formateurs...</p>
                </div>
            )}

            {error && <p className="text-center text-destructive">Impossible de charger les formateurs pour le moment.</p>}

            {!loading && instructors.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {instructors.map(instructor => (
                        <Link key={instructor.id} href={`/instructors/${instructor.id}`} className="group">
                            <Card className="text-center h-full transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
                                <CardContent className="p-6 flex flex-col items-center">
                                    <Avatar className="w-32 h-32 mb-4 border-4 border-transparent group-hover:border-primary transition-colors">
                                        <AvatarImage src={instructor.photoURL || undefined} alt={instructor.name} />
                                        <AvatarFallback className="text-4xl">{instructor.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <h3 className="text-xl font-bold font-headline">{instructor.name}</h3>
                                    <p className="text-primary mt-1 font-medium">{instructor.headline || 'Formateur Expert'}</p>
                                    <p className="text-muted-foreground text-sm mt-2 flex-grow">{instructor.specialite || 'Spécialités variées'}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
             {!loading && instructors.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>Aucun formateur disponible pour le moment.</p>
                </div>
             )}
        </div>
    );
}
    