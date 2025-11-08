'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MessageSquare, Search, Users, ThumbsUp, Book, Library, HelpCircle, LayoutDashboard, MessageCircle, Mic, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Mock data based on the screenshot
const communityPosts = [
    {
        author: 'Fernando C.',
        authorImage: 'instructor-david',
        title: 'Besoin d’aide pour la création de mon cours',
        tags: ['Création de cours', 'Pédagogie'],
        comments: 1,
        votes: 0,
        time: 'il y a 2 heures',
    },
    {
        author: 'Marc B.',
        authorImage: 'testimonial-samuel',
        title: 'Catalogue Udemy Business',
        tags: ['Marketing', 'Support'],
        comments: 2,
        votes: 1,
        time: 'il y a 5 heures',
    },
    {
        author: 'Laurence L.',
        authorImage: 'testimonial-chloe',
        title: 'Importer des vidéos pour mes cours?',
        tags: ['Vidéo', 'Technique'],
        comments: 5,
        votes: 2,
        time: 'il y a 8 heures',
    },
];

const moderators = [
    { name: 'Fernando C.', image: 'instructor-david'},
    { name: 'Sandra L.', image: 'testimonial-fatima'},
];

const leaderboard = [
    { name: 'Jamal Lazaar', image: 'instructor-yann', points: 15 },
    { name: 'Aisha K.', image: 'instructor-aisha', points: 12 },
];

const onlineUsers = ['testimonial-samuel', 'testimonial-chloe', 'instructor-david', 'instructor-yann', 'instructor-aisha'];


export default function CommunityPage() {
    const heroImage = PlaceHolderImages.find(img => img.id === 'hero');

    return (
        <div className="bg-background">
            {/* Hero Section */}
            <section className="bg-primary/10 py-12">
                <div className="container px-4">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h1 className="text-4xl font-bold font-headline text-primary">Bienvenue dans la Communauté</h1>
                            <p className="mt-2 text-lg text-muted-foreground">Posez des questions, trouvez des réponses, partagez votre expérience et collaborez avec d'autres apprenants et formateurs.</p>
                            <div className="mt-6 flex gap-2">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input placeholder="Rechercher dans la communauté..." className="pl-10 h-12"/>
                                </div>
                                <Button size="lg">Rechercher</Button>
                            </div>
                        </div>
                        <div className="hidden md:block text-center">
                           {heroImage && 
                             <Image 
                                src="https://images.unsplash.com/photo-1521737852583-3d3b6b79c3b1?w=800&q=80" 
                                alt="Communauté d'apprenants" 
                                width={400} 
                                height={250} 
                                className="mx-auto rounded-lg" 
                                data-ai-hint="learning community"
                              />
                            }
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
                            <Button>
                                <MessageSquare className="mr-2 h-4 w-4"/>
                                Nouvelle Discussion
                            </Button>
                        </div>
                        <Tabs defaultValue="recent" className="w-full">
                            <TabsList>
                                <TabsTrigger value="recent">Récents</TabsTrigger>
                                <TabsTrigger value="popular">Populaire</TabsTrigger>
                                <TabsTrigger value="unanswered">Sans réponse</TabsTrigger>
                            </TabsList>
                            <TabsContent value="recent" className="mt-4 space-y-4">
                                {communityPosts.map((post, index) => {
                                    const authorImg = PlaceHolderImages.find(img => img.id === post.authorImage);
                                    return (
                                    <Card key={index} className="hover:bg-muted/50 transition-colors">
                                        <CardContent className="p-4 flex gap-4">
                                            <Avatar>
                                                {authorImg && <AvatarImage src={authorImg.imageUrl} />}
                                                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-grow">
                                                <h3 className="font-semibold text-lg hover:text-primary"><Link href="#">{post.title}</Link></h3>
                                                <div className="flex flex-wrap gap-2 my-2">
                                                    {post.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-4">
                                                    <span>Posté par <strong className='text-foreground'>{post.author}</strong> • {post.time}</span>
                                                    <div className="flex gap-4">
                                                         <span className='flex items-center gap-1'><ThumbsUp className='h-3 w-3'/> {post.votes} Votes</span>
                                                         <span className='flex items-center gap-1'><MessageSquare className='h-3 w-3'/> {post.comments} Commentaires</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )})}
                            </TabsContent>
                        </Tabs>
                         <div className="mt-8 text-center">
                            <Button variant="outline">Voir toutes les discussions</Button>
                        </div>
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
                         <Card>
                            <CardHeader><CardTitle>Modérateurs</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                {moderators.map(mod => {
                                    const img = PlaceHolderImages.find(i => i.id === mod.image);
                                    return (<div key={mod.name} className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            {img && <AvatarImage src={img.imageUrl} />}
                                            <AvatarFallback>{mod.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <p className="font-semibold">{mod.name}</p>
                                    </div>)
                                })}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle>Membres en ligne</CardTitle></CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {onlineUsers.map(userId => {
                                    const userImg = PlaceHolderImages.find(i => i.id === userId);
                                    return (
                                        <Avatar key={userId} className="h-9 w-9">
                                            {userImg && <AvatarImage src={userImg.imageUrl} />}
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </main>
        </div>
    );
}
