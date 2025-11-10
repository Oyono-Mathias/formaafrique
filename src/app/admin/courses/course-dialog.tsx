
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useFirestore, useUser } from '@/firebase';
import type { Course } from '@/lib/types';
import { useEffect } from 'react';
import { doc, updateDoc, addDoc, serverTimestamp, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categories } from '@/lib/categories';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useRouter } from 'next/navigation';

const slugify = (text: string) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

const getImageIdFromTitle = (title: string): string => {
    const lowerCaseTitle = title.toLowerCase();
    const imageKeywords: { [key: string]: string[] } = {
        'course-dev-web': ['développement', 'web', 'mobile', 'code', 'html', 'css', 'javascript', 'python', 'flutter'],
        'course-marketing': ['marketing', 'digital', 'commerce', 'vente', 'publicité', 'réseaux sociaux'],
        'course-entrepreneurship': ['entreprise', 'business', 'entrepreneuriat', 'startup'],
        'course-data-science': ['agriculture', 'données', 'data', 'science', 'santé', 'transformation'],
        'course-ai-ml': ['ai', 'intelligence artificielle', 'cybersécurité', 'littératie'],
        'course-project-management': ['gestion', 'management', 'outils', 'canva', 'artisanat', 'couture', 'comptabilité', 'langues', 'tutoriels'],
    };

    for (const id in imageKeywords) {
        for (const keyword of imageKeywords[id]) {
            if (lowerCaseTitle.includes(keyword)) {
                return id;
            }
        }
    }
    return 'course-project-management'; // Fallback image
};


const courseSchema = z.object({
  title: z.string().min(5, { message: 'Le titre doit avoir au moins 5 caractères.' }),
  summary: z.string().min(20, { message: 'La description doit avoir au moins 20 caractères.' }),
  categoryId: z.string().min(1, { message: 'Veuillez sélectionner une catégorie.' }),
  keywords: z.string().optional(),
});

type CourseDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  course: Course | null;
};

export default function CourseDialog({
  isOpen,
  setIsOpen,
  course,
}: CourseDialogProps) {
  const db = useFirestore();
  const { user, userProfile } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!course;

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      summary: '',
      categoryId: '',
      keywords: '',
    },
  });

  useEffect(() => {
    if (isOpen && course) {
      form.reset({
        title: course.title,
        summary: course.summary,
        categoryId: course.categoryId,
        keywords: (course.keywords || []).join(', '),
      });
    } else if (isOpen) {
      form.reset({
        title: '',
        summary: '',
        categoryId: '',
        keywords: '',
      });
    }
  }, [isOpen, course, form]);

  async function onSubmit(values: z.infer<typeof courseSchema>) {
    if (!db || !user) return;
    
    const keywordsArray = values.keywords ? values.keywords.split(',').map(s => s.trim()).filter(s => s) : [];

    try {
      if (isEditing && course?.id) {
        // Update existing course
        const courseDocRef = doc(db, 'formations', course.id);
        const dataPayload = {
          ...values,
          keywords: keywordsArray,
          updatedAt: serverTimestamp()
        };
        await updateDoc(courseDocRef, dataPayload);
        toast({
          title: 'Formation mise à jour',
          description: `"${values.title}" a été modifié avec succès.`,
        });
        setIsOpen(false);
      } else {
        // Create new course
        const dataPayload = {
          ...values,
          authorId: user.uid, // Add authorId on creation
          keywords: keywordsArray,
          price: 0,
          published: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, 'formations'), dataPayload);
        toast({
          title: 'Formation créée avec succès !',
          description: 'Vous pouvez maintenant ajouter des modules et des vidéos.',
        });
        setIsOpen(false);
        if(userProfile?.role === 'formateur') {
            router.push(`/formateur/courses/${docRef.id}/modules`);
        }
      }
    } catch (error) {
      console.error('Error saving course: ', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'enregistrement.",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {isEditing ? 'Modifier la formation' : 'Créer une nouvelle formation'}
          </DialogTitle>
          <DialogDescription>
            Remplissez les détails ci-dessous. Vous pourrez ajouter les modules et vidéos après cette étape.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de la formation</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Introduction au marketing digital" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Résumé</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Décrivez le contenu et les objectifs de la formation." rows={4}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Catégorie</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="keywords"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mots-clés</FormLabel>
                            <FormControl><Input {...field} placeholder="marketing, SEO, réseaux sociaux" /></FormControl>
                             <FormDescription>Séparez les mots-clés par une virgule.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <DialogFooter className="pt-4 sticky bottom-0 bg-background py-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Enregistrer les modifications' : 'Créer et continuer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
