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
                            <h1 className="text-4xl font-bold font-headline text-primary">Bienvenue dans votre communauté</h1>
                            <p className="mt-2 text-lg text-muted-foreground">Posez des questions, trouvez des réponses, partagez votre expérience.</p>
                            <div className="mt-6 flex gap-2">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input placeholder="Rechercher dans la communauté..." className="pl-10 h-12"/>
                                </div>
                                <Button size="lg">Rechercher</Button>
                            </div>
                        </div>
                        <div className="hidden md:block text-center">
                           {heroImage && <Image src="https://images.unsplash.com/photo-1521737852583-3d3b6b79c3b1?w=800&q=80" alt="Communauté" width={400} height={250} className="mx-auto" />}
                        </div>
                    </div>
                </div>
            </section>
            
            <main className="container px-4 py-12">
                 {/* Explore Community Section */}
                <section className="text-center mb-16">
                    <h2 className="text-3xl font-bold font-headline mb-8">Explorer la communauté</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6 flex flex-col items-center gap-4">
                                <MessageCircle className="h-10 w-10 text-primary"/>
                                <h3 className="text-xl font-bold">Discussions</h3>
                                <p className="text-muted-foreground">Participez à des conversations, posez des questions et partagez votre expertise.</p>
                                <Button variant="outline">Voir les discussions</Button>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6 flex flex-col items-center gap-4">
                                <Library className="h-10 w-10 text-primary"/>
                                <h3 className="text-xl font-bold">Annonces et ressources</h3>
                                <p className="text-muted-foreground">Restez informé des dernières nouvelles, des mises à jour de la plateforme et des ressources.</p>
                                <Button variant="outline">Consulter les ressources</Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>


                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <div className="flex justify-between items-center mb-4">
                             <h2 className="text-2xl font-bold font-headline">Toute l'activité de la Communauté</h2>
                            <Button>Nouveau Message</Button>
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
                                    <Card key={index} className="hover:bg-muted/50">
                                        <CardContent className="p-4 flex gap-4">
                                            <Avatar>
                                                {authorImg && <AvatarImage src={authorImg.imageUrl} />}
                                                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
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
                            <Button variant="outline">Voir toutes les discussions de la communauté</Button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-8">
                         <Card>
                            <CardHeader><CardTitle>Ressources de la communauté</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                <Link href="#" className="block text-primary hover:underline">Objectifs et valeurs</Link>
                                <Link href="#" className="block text-primary hover:underline">Principes de la Communauté</Link>
                                <Link href="#" className="block text-primary hover:underline">Comment participer</Link>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle>Rencontrez vos modérateurs</CardTitle></CardHeader>
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
                            <CardHeader><CardTitle>Qui est en ligne ?</CardTitle></CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {onlineUsers.map(userId => {
                                    const userImg = PlaceHolderImages.find(i => i.id === userId);
                                    return (
                                        <Avatar key={userId}>
                                            {userImg && <AvatarImage src={userImg.imageUrl} />}
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    </aside>
                </div>

                 {/* Instructor Resources */}
                <section className="mt-20">
                     <h2 className="text-3xl font-bold font-headline text-center mb-8">Ressources formateur</h2>
                     <div className="grid md:grid-cols-3 gap-8">
                        <Card>
                            <CardHeader className="items-center text-center">
                                <HelpCircle className="h-10 w-10 text-primary mb-2" />
                                <CardTitle>Aide et support</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-muted-foreground">Vous avez une question ? Consultez nos articles d'aide pour trouver des réponses.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="items-center text-center">
                                <Book className="h-10 w-10 text-primary mb-2" />
                                <CardTitle>Le Teaching Center</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-muted-foreground">Apprenez à créer des cours et à en faire la promotion auprès des participants.</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="items-center text-center">
                                <LayoutDashboard className="h-10 w-10 text-primary mb-2" />
                                <CardTitle>Tableau de bord des performances</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-muted-foreground">Découvrez le succès que rencontrent vos cours publiés.</p>
                            </CardContent>
                        </Card>
                     </div>
                </section>
            </main>
        </div>
    );
}
