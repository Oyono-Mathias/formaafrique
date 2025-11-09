'use client';

import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { revalidateInstructor } from '@/actions/revalidate-instructor';
import { useRouter } from 'next/navigation';
import type { InstructorProfile } from '@/lib/types';


const updateSchema = z.object({
  bio: z.string().min(100, { message: "La biographie doit contenir au moins 100 caractères." }),
  videoUrl: z.string().url({ message: "Veuillez fournir une URL de vidéo valide." }),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
});


export default function UpdateInstructorPage() {
    const { user, userProfile } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof updateSchema>>({
        resolver: zodResolver(updateSchema),
        defaultValues: {
            bio: '',
            videoUrl: '',
            facebookUrl: '',
            instagramUrl: '',
            twitterUrl: '',
            youtubeUrl: '',
        }
    });

    useEffect(() => {
        if(userProfile) {
            const instructorProfile = userProfile as InstructorProfile;
            form.reset({
                bio: instructorProfile.bio || '',
                videoUrl: instructorProfile.videoUrl || '',
                facebookUrl: instructorProfile.socialLinks?.facebookUrl || '',
                instagramUrl: instructorProfile.socialLinks?.instagramUrl || '',
                twitterUrl: instructorProfile.socialLinks?.twitterUrl || '',
                youtubeUrl: instructorProfile.socialLinks?.youtubeUrl || '',
            })
        }
    }, [userProfile, form]);
    
    const onSubmit = async (values: z.infer<typeof updateSchema>) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            await revalidateInstructor({
                uid: user.uid,
                ...values,
            });
            toast({
                title: "Profil mis à jour !",
                description: "Votre profil est en cours de ré-évaluation par nos systèmes. Vous serez redirigé...",
            });
            // Redirect to dashboard, the layout will handle the "pending" state display
            router.push('/formateur');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: error.message || "La mise à jour a échoué."
            });
        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <div className="container mx-auto max-w-4xl py-12">
            <Card className="border-amber-500 bg-amber-50/50">
                <CardHeader>
                    <div className='flex items-center gap-4'>
                        <AlertCircle className='h-8 w-8 text-amber-600'/>
                        <div>
                            <CardTitle className="text-amber-800">Mise à jour de votre profil requise</CardTitle>
                            <CardDescription className="text-amber-700">
                                FormaAfrique a mis à jour ses critères de validation pour garantir la qualité. Veuillez compléter votre profil pour continuer à utiliser votre tableau de bord de formateur.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Compléter mon profil de formateur</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <Label htmlFor="bio">Biographie</Label>
                            <Textarea id="bio" {...form.register('bio')} rows={5} placeholder="Parlez de votre parcours, vos expertises..." />
                            {form.formState.errors.bio && <p className="text-sm text-destructive mt-1">{form.formState.errors.bio.message}</p>}
                        </div>
                         <div>
                            <Label htmlFor="videoUrl">Lien vers votre vidéo de présentation (YouTube, Google Drive, etc.)</Label>
                            <Input id="videoUrl" {...form.register('videoUrl')} />
                            {form.formState.errors.videoUrl && <p className="text-sm text-destructive mt-1">{form.formState.errors.videoUrl.message}</p>}
                        </div>
                        <div>
                            <Label>Réseaux sociaux professionnels</Label>
                            <div className="space-y-2 mt-2">
                                <Input placeholder="URL Profil Facebook" {...form.register('facebookUrl')} />
                                <Input placeholder="URL Profil Instagram" {...form.register('instagramUrl')} />
                                <Input placeholder="URL Chaîne YouTube" {...form.register('youtubeUrl')} />
                                <Input placeholder="URL Profil Twitter / X" {...form.register('twitterUrl')} />
                            </div>
                        </div>
                        <Button type="submit" size="lg" disabled={isSubmitting}>
                             {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                             Mettre à jour et valider mon profil
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
