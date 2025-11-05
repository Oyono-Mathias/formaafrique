'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useDoc, useCollection, useFirestore } from '@/firebase';
import type { Course, Module } from '@/lib/types';
import { Loader2, ArrowLeft, PlusCircle, Video, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc } from 'firebase/firestore';

const moduleSchema = z.object({
  titre: z.string().min(3, { message: 'Le titre doit avoir au moins 3 caractères.' }),
  description: z.string().min(10, { message: 'La description doit avoir au moins 10 caractères.' }),
  videoUrl: z.string().url({ message: 'Veuillez entrer une URL de vidéo valide (YouTube ou Google Drive).' }),
});

export default function ManageModulesPage({ params }: { params: { id: string } }) {
  const { data: course, loading: courseLoading } = useDoc<Course>('courses', params.id);
  const { data: modulesData, loading: modulesLoading } = useCollection<Module>(`courses/${params.id}/modules`);
  const db = useFirestore();
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const sortedModules = useMemo(() => {
    return (modulesData || []).sort((a, b) => a.ordre - b.ordre);
  }, [modulesData]);

  const form = useForm<z.infer<typeof moduleSchema>>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      titre: '',
      description: '',
      videoUrl: '',
    },
  });

  async function onSubmit(values: z.infer<typeof moduleSchema>) {
    if (!db || !course?.id) return;
    
    try {
      const modulesCollectionRef = collection(db, 'courses', course.id, 'modules');
      await addDoc(modulesCollectionRef, {
        ...values,
        ordre: (sortedModules.length || 0) + 1,
        videos: [
          {
            titre: 'Vidéo principale',
            url: values.videoUrl,
            ordre: 1,
          }
        ]
      });

      toast({
        title: 'Module ajouté !',
        description: `Le module "${values.titre}" a été ajouté à votre formation.`,
      });
      form.reset();
      setPreviewUrl(null);
    } catch (error) {
      console.error("Error adding module:", error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible d'ajouter le module.",
      });
    }
  }

  const getEmbedUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        const videoId = urlObj.hostname.includes('youtu.be')
          ? urlObj.pathname.slice(1)
          : urlObj.searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      if (urlObj.hostname.includes('drive.google.com')) {
        const fileId = urlObj.pathname.split('/')[3];
        return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const handlePreview = () => {
    const url = form.getValues('videoUrl');
    const embedUrl = getEmbedUrl(url);
    if(embedUrl) {
      setPreviewUrl(embedUrl);
    } else {
        toast({
            variant: "destructive",
            title: "URL non valide",
            description: "Veuillez fournir un lien YouTube ou Google Drive valide."
        })
    }
  }

  if (courseLoading || modulesLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Chargement de la formation...</div>;
  }

  if (!course) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <Link href="/formateur/courses" className="flex items-center text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à mes formations
      </Link>

      <div>
        <h1 className="text-3xl font-bold font-headline">{course.titre}</h1>
        <p className="text-muted-foreground">Gérez les modules et les vidéos de votre formation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <Card>
            <CardHeader>
              <CardTitle>Ajouter un nouveau module</CardTitle>
              <CardDescription>Remplissez le formulaire pour ajouter une nouvelle leçon à votre cours.</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="titre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre du module</FormLabel>
                        <FormControl><Input {...field} placeholder="Ex: Introduction à la comptabilité" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea {...field} placeholder="Que vont apprendre les étudiants dans ce module ?" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de la vidéo (YouTube ou Google Drive)</FormLabel>
                        <FormControl><Input {...field} placeholder="https://www.youtube.com/watch?v=..." /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {previewUrl && (
                    <div className="aspect-video w-full rounded-md overflow-hidden border">
                      <iframe
                        src={previewUrl}
                        title="Aperçu vidéo"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className='w-full h-full'
                      ></iframe>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handlePreview}>Prévisualiser la vidéo</Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter le module
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>

        <div>
           <Card>
            <CardHeader>
              <CardTitle>Modules existants ({sortedModules.length})</CardTitle>
              <CardDescription>Liste des leçons de votre formation.</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedModules.length > 0 ? (
                <div className="space-y-4">
                  {sortedModules.map(module => (
                    <div key={module.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                         <Video className="h-5 w-5 text-primary"/>
                         <p className="font-semibold">{module.titre}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>Aucun module ajouté pour le moment.</p>
                  <p className="text-sm">Utilisez le formulaire pour commencer.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
