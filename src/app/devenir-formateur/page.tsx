
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, Rocket, Award, Users, Languages, Star, Globe, TrendingUp, Loader2, CheckCircle, AlertCircle, Video, ListPlus, Send, ShieldCheckIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useUser, useCollection } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect } from 'react';
import type { InstructorRequest, Enrollment, UserProfile } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { createInstructorRequest } from '@/actions/instructor-request';
import { evaluateCandidate, CandidateEvaluationOutput } from '@/ai/flows/evaluate-candidate-flow';

const requestSchema = z.object({
  specialite: z.string().min(5, { message: "Veuillez décrire votre spécialité (min. 5 caractères)." }),
  motivation: z.string().min(50, { message: "Veuillez développer votre motivation (min. 50 caractères)." }),
  videoUrl: z.string().url({ message: "Veuillez fournir une URL de vidéo valide." }),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
});

export default function BecomeInstructorPage() {
    const { t } = useLanguage();
    const { user, userProfile } = useUser();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [evaluationResult, setEvaluationResult] = useState<CandidateEvaluationOutput | null>(null);

    const form = useForm<z.infer<typeof requestSchema>>({
      resolver: zodResolver(requestSchema),
      defaultValues: {
        specialite: '',
        motivation: '',
        videoUrl: '',
        facebookUrl: '',
        instagramUrl: '',
        twitterUrl: '',
        youtubeUrl: '',
      },
    });

    const instructorRequestOptions = useMemo(() => {
        if (!user?.uid) return undefined;
        return { where: ['userId', '==', user.uid] as [string, '==', string] };
    }, [user?.uid]);

    const { data: requests, loading: requestsLoading } = useCollection<InstructorRequest>(
        user?.uid ? 'instructor_requests' : null,
        instructorRequestOptions
    );
    
    const { data: enrollments, loading: enrollmentsLoading } = useCollection<Enrollment>(
        user?.uid ? `users/${user.uid}/enrollments` : null
    );

    const pendingRequest = useMemo(() => {
        return (requests || []).find(r => r.status === 'pending' || r.status === 'en_attente');
    }, [requests]);

    const prerequisites = useMemo(() => {
        const profile = userProfile as UserProfile & { bio?: string; photoURL?: string; };
        const isEmailVerified = user?.emailVerified || false;
        const isProfileComplete = !!(
            profile?.bio && profile.bio.length >= 100 &&
            profile.photoURL
        );
        const completedCoursesCount = (enrollments || []).filter(e => (e.progression || 0) >= 100).length;
        const hasCompletedThreeCourses = completedCoursesCount >= 3;

        return {
            isEmailVerified,
            isProfileComplete,
            completedCoursesCount,
            hasCompletedThreeCourses,
            canApply: isEmailVerified && isProfileComplete && hasCompletedThreeCourses,
        };
    }, [user, userProfile, enrollments]);

    const handleSubmit = async (values: z.infer<typeof requestSchema>) => {
        if (!user || !userProfile || !prerequisites.canApply) {
            toast({ variant: 'destructive', title: 'Conditions non remplies', description: 'Veuillez remplir toutes les conditions avant de soumettre.' });
            return;
        }
        setIsSubmitting(true);
        setEvaluationResult(null);
        
        try {
            // 1. Submit the application to Firestore
            await createInstructorRequest({ uid: user.uid, ...values });
            toast({ title: 'Candidature envoyée !', description: "Analyse par l'IA en cours..." });
            
            // 2. Trigger AI evaluation
            const result = await evaluateCandidate({ uid: user.uid });
            setEvaluationResult(result);
            
            // Optionally, show a toast based on result
            if(result.statut === 'éligible') {
                 toast({ title: 'Évaluation terminée : Éligible !', description: 'Votre dossier va être transmis pour validation finale.' });
            } else {
                 toast({ variant: 'default', title: 'Évaluation terminée', description: result.message_feedback });
            }

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erreur', description: error.message || 'Une erreur est survenue.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const stats = [
        { label: "Participants", value: "80M", icon: Users },
        { label: "Langues", value: "+ de 75", icon: Languages },
        { label: "Inscriptions", value: "1.1Mds", icon: Star },
        { label: "Pays", value: "+ de 180", icon: Globe },
    ];
    
    const renderResultCard = () => {
        if (!evaluationResult) return null;

        const statusConfig = {
            éligible: {
                title: "Félicitations, vous êtes éligible !",
                Icon: CheckCircle,
                color: "green",
            },
            en_attente: {
                title: "Votre dossier est presque prêt !",
                Icon: AlertCircle,
                color: "amber",
            },
            refusé: {
                title: "Quelques ajustements nécessaires",
                Icon: AlertCircle,
                color: "red",
            },
        };

        const config = statusConfig[evaluationResult.statut];

        return (
             <Card className={`border-${config.color}-500 bg-${config.color}-50`}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <config.Icon className={`w-8 h-8 text-${config.color}-600`} />
                        <CardTitle className={`text-${config.color}-800`}>{config.title}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className={`text-${config.color}-700`}>{evaluationResult.message_feedback}</p>
                    {evaluationResult.statut === 'éligible' && <p className='mt-4 font-semibold'>Votre candidature a été transmise à notre équipe pour une validation finale. Vous serez notifié(e) par email.</p>}
                </CardContent>
            </Card>
        )
    }

    const renderCallToActionSection = () => {
        if (!user) {
            return (
                <div className="text-center py-20 bg-primary/10">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">Devenez formateur dès aujourd'hui</h2>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">Rejoignez l'une des plus grandes plates-formes d'apprentissage en ligne au monde.</p>
                    <Button size="lg" className="mt-8" asChild><Link href="/login?tab=signup">Rejoindre la communauté</Link></Button>
                </div>
            );
        }

        if (userProfile?.role === 'formateur') {
            return (
                 <div className="text-center py-20 bg-green-50 border-y border-green-200">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline text-green-800">Vous êtes déjà formateur !</h2>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-green-700">Accédez à votre tableau de bord pour créer et gérer vos formations.</p>
                    <Button size="lg" className="mt-8 bg-green-600 hover:bg-green-700" asChild><Link href="/formateur">Accéder à mon tableau de bord</Link></Button>
                </div>
            )
        }

        if (requestsLoading || enrollmentsLoading) {
            return <div className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;
        }

        if (pendingRequest) {
            return (
                <div className="text-center py-20 bg-blue-50 border-y border-blue-200">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline text-blue-800">Candidature en cours d'examen</h2>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-blue-700">Merci pour votre intérêt. Notre équipe examine votre profil et reviendra vers vous très prochainement.</p>
                </div>
            );
        }
        
        return (
            <section className="py-16 sm:py-24" id="application-form">
                <div className="container px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold font-headline">Prêt à postuler ?</h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                           Remplissez les conditions et soumettez votre dossier pour commencer votre parcours de formateur.
                        </p>
                    </div>

                    <div className="mt-12 max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                        {/* Prerequisites */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold">Conditions requises</h3>
                            <Card className={prerequisites.isEmailVerified ? "border-green-500" : "border-amber-500"}>
                                <CardContent className="p-4 flex items-center gap-3">
                                    {prerequisites.isEmailVerified ? <CheckCircle className="w-5 h-5 text-green-500"/> : <AlertCircle className="w-5 h-5 text-amber-500"/>}
                                    <span className="font-medium">Adresse email vérifiée</span>
                                </CardContent>
                            </Card>
                             <Card className={prerequisites.isProfileComplete ? "border-green-500" : "border-amber-500"}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {prerequisites.isProfileComplete ? <CheckCircle className="w-5 h-5 text-green-500"/> : <AlertCircle className="w-5 h-5 text-amber-500"/>}
                                        <span className="font-medium">Profil complet (photo, bio ≥ 100 car.)</span>
                                    </div>
                                     {!prerequisites.isProfileComplete && <Button asChild size="sm" variant="outline"><Link href="/dashboard/settings">Compléter</Link></Button>}
                                </CardContent>
                            </Card>
                            <Card className={prerequisites.hasCompletedThreeCourses ? "border-green-500" : "border-amber-500"}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {prerequisites.hasCompletedThreeCourses ? <CheckCircle className="w-5 h-5 text-green-500"/> : <AlertCircle className="w-5 h-5 text-amber-500"/>}
                                        <span className="font-medium">Avoir terminé au moins 3 formations ({prerequisites.completedCoursesCount}/3)</span>
                                    </div>
                                    {!prerequisites.hasCompletedThreeCourses && <Button asChild size="sm" variant="outline"><Link href="/courses">Explorer</Link></Button>}
                                </CardContent>
                            </Card>
                             {evaluationResult && renderResultCard()}
                        </div>
                        {/* Application Form */}
                        <div className="space-y-6">
                             <h3 className="text-xl font-bold">Dossier de candidature</h3>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                                <div><Label htmlFor="specialite">Votre spécialité principale</Label><Input id="specialite" {...form.register('specialite')} /> {form.formState.errors.specialite && <p className="text-sm text-destructive mt-1">{form.formState.errors.specialite.message}</p>}</div>
                                <div><Label htmlFor="videoUrl">Lien vers une mini-vidéo de présentation (1-2 min)</Label><Input id="videoUrl" placeholder="https://youtube.com/..." {...form.register('videoUrl')} /> {form.formState.errors.videoUrl && <p className="text-sm text-destructive mt-1">{form.formState.errors.videoUrl.message}</p>}</div>
                                <div><Label htmlFor="motivation">Pourquoi souhaitez-vous enseigner sur FormaAfrique ?</Label><Textarea id="motivation" {...form.register('motivation')} /> {form.formState.errors.motivation && <p className="text-sm text-destructive mt-1">{form.formState.errors.motivation.message}</p>}</div>
                                <div><Label>Réseaux sociaux professionnels (optionnel)</Label>
                                <div className="space-y-2 mt-2">
                                <Input placeholder="URL Profil Facebook" {...form.register('facebookUrl')} />
                                <Input placeholder="URL Profil Instagram" {...form.register('instagramUrl')} />
                                <Input placeholder="URL Profil Twitter / X" {...form.register('twitterUrl')} />
                                <Input placeholder="URL Chaîne YouTube" {...form.register('youtubeUrl')} />
                                </div>
                                </div>
                                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || !prerequisites.canApply}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    {isSubmitting ? "Analyse en cours..." : prerequisites.canApply ? "Soumettre ma candidature" : "Conditions non remplies"}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <div className="bg-background">
            {/* Hero Section */}
            <section className="bg-primary/10 py-20 text-center">
                <div className="container px-4">
                    <Award className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Devenez Formateur sur FormaAfrique</h1>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        Partagez votre expertise, inspirez des milliers d'apprenants et construisez l'avenir de l'éducation en Afrique.
                    </p>
                </div>
            </section>
            
            {/* How it works */}
            <section className="py-16 sm:py-24">
                <div className="container px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold font-headline">Comment ça marche ?</h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                           Un processus simple et transparent pour rejoindre notre communauté de formateurs.
                        </p>
                    </div>
                    <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex flex-col items-center text-center"><div className="relative mb-4"><div className="p-4 bg-primary/10 rounded-full"><Users className="w-10 h-10 text-primary"/></div><div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">1</div></div><h3 className="text-xl font-bold mt-2">Remplissez les conditions</h3><p className="mt-2 text-muted-foreground">Assurez-vous que votre profil est complet et que vous avez terminé au moins 3 cours sur la plateforme.</p></div>
                        <div className="flex flex-col items-center text-center"><div className="relative mb-4"><div className="p-4 bg-primary/10 rounded-full"><ListPlus className="w-10 h-10 text-primary"/></div><div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">2</div></div><h3 className="text-xl font-bold mt-2">Soumettez votre dossier</h3><p className="mt-2 text-muted-foreground">Remplissez le formulaire de candidature avec votre spécialité, une vidéo de présentation et vos motivations.</p></div>
                        <div className="flex flex-col items-center text-center"><div className="relative mb-4"><div className="p-4 bg-primary/10 rounded-full"><ShieldCheckIcon className="w-10 h-10 text-primary"/></div><div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">3</div></div><h3 className="text-xl font-bold mt-2">Validation par l'équipe</h3><p className="mt-2 text-muted-foreground">Notre équipe examine votre candidature. Ce processus peut prendre quelques jours.</p></div>
                        <div className="flex flex-col items-center text-center"><div className="relative mb-4"><div className="p-4 bg-primary/10 rounded-full"><Rocket className="w-10 h-10 text-primary"/></div><div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">4</div></div><h3 className="text-xl font-bold mt-2">Lancez votre 1er cours</h3><p className="mt-2 text-muted-foreground">Une fois approuvé, publiez votre première formation et commencez à enseigner !</p></div>
                    </div>
                </div>
            </section>

             {/* Stats Section */}
            <section className="bg-primary text-primary-foreground py-16">
                <div className="container px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map(stat => (<div key={stat.label} className="flex flex-col items-center"><stat.icon className="w-10 h-10 mb-2" /><p className="text-3xl md:text-4xl font-bold">{stat.value}</p><p className="text-sm md:text-base text-primary-foreground/80">{stat.label}</p></div>))}
                    </div>
                </div>
            </section>
            
            {renderCallToActionSection()}

        </div>
    );
}
