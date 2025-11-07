'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lightbulb, Rocket, Award, Users, Languages, Star, Globe, TrendingUp, Loader2, CheckCircle, AlertCircle, ListPlus, Send, Video, ShieldCheckIcon } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLanguage } from '@/contexts/language-context';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import type { InstructorRequest } from '@/lib/types';


export default function BecomeInstructorPage() {
    const { t } = useLanguage();
    const { user, userProfile } = useUser();
    const db = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch existing requests for the current user
    const { data: requests, loading: requestsLoading } = useCollection<InstructorRequest>(
        'instructor_requests',
        user?.uid ? { where: ['userId', '==', user.uid] } : undefined
    );

    const pendingRequest = useMemo(() => {
        return (requests || []).find(r => r.status === 'pending');
    }, [requests]);

    const isProfileComplete = useMemo(() => {
        if (!userProfile) return false;
        const hasBio = !!userProfile.bio && userProfile.bio.trim().length > 0;
        const hasPhoto = !!userProfile.photoURL;
        const hasSkills = !!userProfile.skills && userProfile.skills.length > 0;
        return hasBio && hasPhoto && hasSkills;
    }, [userProfile]);


    const handleRequest = async () => {
        if (!user || !userProfile || !db) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté pour faire une demande.' });
            return;
        }

        if (!isProfileComplete) {
            toast({ variant: 'destructive', title: 'Profil incomplet', description: 'Veuillez compléter votre profil pour devenir formateur.' });
            return;
        }

        setIsSubmitting(true);

        // Double check if a pending request exists
        const q = query(collection(db, "instructor_requests"), where("userId", "==", user.uid), where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            toast({ title: 'Demande déjà envoyée', description: 'Vous avez déjà une demande en cours de validation.' });
            setIsSubmitting(false);
            return;
        }

        try {
            await addDoc(collection(db, 'instructor_requests'), {
                userId: user.uid,
                userName: userProfile.name,
                userEmail: userProfile.email,
                requestDate: serverTimestamp(),
                status: 'pending'
            });
            toast({ title: 'Demande envoyée !', description: 'Votre demande a été envoyée pour validation. Nous vous contacterons bientôt.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const stats = [
        { label: t('instructor_stats_participants'), value: "80M", icon: Users },
        { label: t('instructor_stats_languages'), value: t('instructor_stats_languages_value'), icon: Languages },
        { label: t('instructor_stats_enrollments'), value: "1.1Mds", icon: Star },
        { label: t('instructor_stats_countries'), value: "+ de 180", icon: Globe },
    ];
    
    const testimonials = [
        {
            name: "Thibault Houdon",
            role: t('instructor_testimonial1_role'),
            quote: t('instructor_testimonial1_quote'),
            imageId: "testimonial-samuel"
        },
        {
            name: "Sandra L",
            role: t('instructor_testimonial2_role'),
            quote: t('instructor_testimonial2_quote'),
            imageId: "testimonial-fatima"
        },
        {
            name: "Jamal Lazaar",
            role: t('instructor_testimonial3_role'),
            quote: t('instructor_testimonial3_quote'),
            imageId: "instructor-david"
        }
    ];

    const renderCallToActionButton = () => {
        if (!user) {
            return <Button size="lg" className="mt-8" asChild><Link href="/login?tab=signup">{t('instructor_cta_button')}</Link></Button>;
        }
        if (userProfile?.role === 'formateur') {
            return <Button size="lg" className="mt-8" asChild><Link href="/formateur">Accéder à mon tableau de bord</Link></Button>;
        }
        if (requestsLoading) {
            return <Button size="lg" className="mt-8" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Chargement...</Button>;
        }
        if (pendingRequest) {
            return <Button size="lg" className="mt-8 bg-green-600 hover:bg-green-700" disabled><CheckCircle className="mr-2 h-4 w-4" /> Demande en cours</Button>;
        }

        return (
            <div className='flex flex-col items-center gap-4'>
                {!isProfileComplete && (
                    <Card className="max-w-2xl bg-amber-50 border-amber-500 text-amber-900">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <AlertCircle className="w-6 h-6 text-amber-700"/>
                            <div>
                                <CardTitle>Profil incomplet</CardTitle>
                                <CardDescription className='text-amber-800'>
                                    Pour devenir formateur, votre profil doit être complet (photo, biographie et compétences).
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <Button asChild>
                                <Link href="/dashboard/settings">Compléter mon profil</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
                 <Button size="lg" className="mt-4" onClick={handleRequest} disabled={isSubmitting || !isProfileComplete}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('submit_instructor_request')}
                </Button>
            </div>
        );
    }


    return (
        <div className="bg-background">
            {/* Hero Section */}
            <section className="bg-primary/10 py-20 text-center">
                <div className="container px-4">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{t('instructor_hero_title')}</h1>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        {t('instructor_hero_subtitle')}
                    </p>
                    <div className='mt-8'>
                        {renderCallToActionButton()}
                    </div>
                </div>
            </section>
            
            {/* How it works */}
            <section className="py-16 sm:py-24">
                <div className="container px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold font-headline">Comment ça marche ?</h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                           Un processus simple et direct pour partager votre passion.
                        </p>
                    </div>
                    <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <div className="p-4 bg-primary/10 rounded-full"><Users className="w-10 h-10 text-primary"/></div>
                                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">1</div>
                            </div>
                            <h3 className="text-xl font-bold mt-2">Créez votre compte</h3>
                            <p className="mt-2 text-muted-foreground">Inscrivez-vous sur la plateforme. Si vous avez déjà un compte étudiant, vous pouvez l'utiliser.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                             <div className="relative mb-4">
                                <div className="p-4 bg-primary/10 rounded-full"><ListPlus className="w-10 h-10 text-primary"/></div>
                                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">2</div>
                            </div>
                            <h3 className="text-xl font-bold mt-2">Préparez votre cours</h3>
                            <p className="mt-2 text-muted-foreground">Définissez votre plan de cours et enregistrez vos vidéos. Nous vous aidons avec des ressources et une communauté de soutien.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <div className="p-4 bg-primary/10 rounded-full"><Send className="w-10 h-10 text-primary"/></div>
                                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">3</div>
                            </div>
                            <h3 className="text-xl font-bold mt-2">Soumettez votre demande</h3>
                            <p className="mt-2 text-muted-foreground">Remplissez votre profil et envoyez votre demande pour devenir formateur via cette page.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                             <div className="relative mb-4">
                                <div className="p-4 bg-primary/10 rounded-full"><ShieldCheckIcon className="w-10 h-10 text-primary"/></div>
                                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">4</div>
                            </div>
                            <h3 className="text-xl font-bold mt-2">Validation & Publication</h3>
                            <p className="mt-2 text-muted-foreground">Une fois votre demande approuvée, vous pourrez créer et soumettre vos cours pour validation par notre équipe.</p>
                        </div>
                    </div>
                </div>
            </section>

             {/* Stats Section */}
            <section className="bg-primary text-primary-foreground py-16">
                <div className="container px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map(stat => (
                            <div key={stat.label} className="flex flex-col items-center">
                                <stat.icon className="w-10 h-10 mb-2" />
                                <p className="text-3xl md:text-4xl font-bold">{stat.value}</p>
                                <p className="text-sm md:text-base text-primary-foreground/80">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 sm:py-24 bg-background">
                <div className="container px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                         {testimonials.map((testimonial) => {
                             const avatarImage = PlaceHolderImages.find((img) => img.id === testimonial.imageId);
                             return (
                                 <Card key={testimonial.name} className="border-0 shadow-none bg-transparent">
                                    <CardContent className="p-0">
                                        <blockquote className="text-lg font-semibold leading-8 tracking-tight text-foreground">
                                            <p>« {testimonial.quote} »</p>
                                        </blockquote>
                                        <figcaption className="mt-6 flex items-center gap-x-4">
                                            <Avatar>
                                                {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt={testimonial.name} />}
                                                <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-semibold text-foreground">{testimonial.name}</div>
                                                <div className="text-muted-foreground">{testimonial.role}</div>
                                            </div>
                                        </figcaption>
                                    </CardContent>
                                 </Card>
                             )
                         })}
                    </div>
                </div>
            </section>

             {/* Support Section */}
            <section className="bg-primary/10 py-16 sm:py-24">
                <div className="container px-4 text-center max-w-4xl mx-auto">
                     <h2 className="text-3xl font-bold font-headline">{t('instructor_support_title')}</h2>
                     <p className="mt-4 text-lg text-muted-foreground">
                        {t('instructor_support_text')}
                     </p>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 text-center">
                 <div className="container px-4">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">{t('instructor_cta_title')}</h2>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        {t('instructor_cta_subtitle')}
                    </p>
                    <div className='mt-8'>
                        {renderCallToActionButton()}
                    </div>
                </div>
            </section>
        </div>
    );
}
