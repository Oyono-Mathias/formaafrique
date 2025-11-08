'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useCollection, useFirestore } from '@/firebase';
import type { CommunityPost } from '@/lib/types';
import { MessageSquare, Search, Users, ThumbsUp, HelpCircle, Book, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const postSchema = z.object({
  title: z.string().min(5, { message: "Le titre doit avoir au moins 5 caractères." }),
  content: z.string().min(20, { message: "Le contenu doit avoir au moins 20 caractères." }),
  tags: z.string().min(3, { message: "Veuillez ajouter au moins un tag." }),
});

export default function CommunityPage() {
    const { data: postsData, loading, error } = useCollection<CommunityPost>('community_posts');
    const { user, userProfile } = useUser();
    const db = useFirestore();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const sortedPosts = useMemo(() => {
        return (postsData || []).sort((a, b) => {
            const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
            const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
            return dateB - dateA;
        });
    }, [postsData]);

    const form = useForm<z.infer<typeof postSchema>>({
        resolver: zodResolver(postSchema),
        defaultValues: { title: '', content: '', tags: '' },
    });

    async function onSubmit(values: z.infer<typeof postSchema>) {
        if (!user || !userProfile || !db) return;

        const tagsArray = values.tags.split(',').map(tag => tag.trim()).filter(Boolean);

        try {
            await addDoc(collection(db, 'community_posts'), {
                title: values.title,
                content: values.content,
                authorId: user.uid,
                authorName: userProfile.name,
                authorImage: userProfile.photoURL || '',
                tags: tagsArray,
                createdAt: serverTimestamp(),
                commentCount: 0,
                voteCount: 0,
            });
            toast({ title: "Discussion publiée !", description: "Votre message est maintenant visible par la communauté." });
            setIsDialogOpen(false);
            form.reset();
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: "Erreur", description: "Impossible de publier la discussion." });
        }
    }

    return (
        <div className="bg-background">
            {/* Hero Section */}
            <section className="bg-primary/10 py-12">
                <div className="container px-4">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold font-headline text-primary">Bienvenue dans la Communauté</h1>
                        <p className="mt-2 text-lg text-muted-foreground">Posez des questions, trouvez des réponses, et collaborez avec d'autres apprenants.</p>
                        <div className="mt-6 flex justify-center gap-2">
                            <div className="relative flex-grow max-w-lg">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="Rechercher dans la communauté..." className="pl-10 h-12" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <main className="container px-4 py-12">
                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <div className="flex justify-between items-center mb-4">
                             <h2 className="text-2xl font-bold font-headline">Discussions Récentes</h2>
                             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button disabled={!user}>
                                        <MessageSquare className="mr-2 h-4 w-4"/>
                                        Nouvelle Discussion
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Lancer une nouvelle discussion</DialogTitle>
                                    </DialogHeader>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                            <FormField control={form.control} name="title" render={({ field }) => (
                                                <FormItem><FormLabel>Titre</FormLabel><FormControl><Input {...field} placeholder="Quel est le sujet principal ?" /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={form.control} name="content" render={({ field }) => (
                                                <FormItem><FormLabel>Votre question ou message</FormLabel><FormControl><Textarea {...field} placeholder="Décrivez votre question en détail..." rows={5} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={form.control} name="tags" render={({ field }) => (
                                                <FormItem><FormLabel>Tags</FormLabel><FormControl><Input {...field} placeholder="Ex: marketing, javascript, business" /></FormControl><p className='text-xs text-muted-foreground'>Séparez les tags par une virgule.</p><FormMessage /></FormItem>
                                            )}/>
                                            <DialogFooter>
                                                <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
                                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                                    Publier
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                             </Dialog>
                        </div>
                        <Tabs defaultValue="recent" className="w-full">
                            <TabsList>
                                <TabsTrigger value="recent">Récents</TabsTrigger>
                                <TabsTrigger value="popular">Populaire</TabsTrigger>
                                <TabsTrigger value="unanswered">Sans réponse</TabsTrigger>
                            </TabsList>
                            <TabsContent value="recent" className="mt-4 space-y-4">
                                {loading && (
                                    <div className="flex justify-center items-center h-40">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                )}
                                {error && <p className="text-destructive text-center">Erreur de chargement des discussions.</p>}
                                {!loading && sortedPosts.length > 0 ? sortedPosts.map((post) => (
                                    <Card key={post.id} className="hover:bg-muted/50 transition-colors">
                                        <CardContent className="p-4 flex gap-4">
                                            <Avatar>
                                                <AvatarImage src={post.authorImage} />
                                                <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-grow">
                                                <h3 className="font-semibold text-lg hover:text-primary"><Link href="#">{post.title}</Link></h3>
                                                <div className="flex flex-wrap gap-2 my-2">
                                                    {post.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-4">
                                                    <span>Posté par <strong className='text-foreground'>{post.authorName}</strong> • {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: fr }) : ''}</span>
                                                    <div className="flex gap-4">
                                                         <span className='flex items-center gap-1'><ThumbsUp className='h-3 w-3'/> {post.voteCount} Votes</span>
                                                         <span className='flex items-center gap-1'><MessageSquare className='h-3 w-3'/> {post.commentCount} Commentaires</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )) : !loading && (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p>Aucune discussion pour le moment. Soyez le premier à en lancer une !</p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-8">
                         <Card>
                            <CardHeader>
                                <CardTitle>Règles et Ressources</CardTitle>
                                <CardDescription>Consultez les bonnes pratiques de la communauté.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href="#" className="flex items-center text-sm text-primary hover:underline p-2 rounded-md hover:bg-primary/5">
                                    <Book className="mr-3 h-4 w-4"/> Objectifs et valeurs de la communauté
                                </Link>
                                <Link href="#" className="flex items-center text-sm text-primary hover:underline p-2 rounded-md hover:bg-primary/5">
                                    <Users className="mr-3 h-4 w-4"/> Principes et code de conduite
                                </Link>
                                <Link href="#" className="flex items-center text-sm text-primary hover:underline p-2 rounded-md hover:bg-primary/5">
                                    <HelpCircle className="mr-3 h-4 w-4"/> Comment poser une bonne question ?
                                </Link>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </main>
        </div>
    );
}