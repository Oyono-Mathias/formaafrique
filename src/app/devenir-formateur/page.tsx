'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lightbulb, Rocket, Award, Users, Languages, Star, Globe, TrendingUp } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const stats = [
    { label: "Participants", value: "80M", icon: Users },
    { label: "Langues", value: "+ de 75", icon: Languages },
    { label: "Inscriptions", value: "1.1Mds", icon: Star },
    { label: "Pays", value: "+ de 180", icon: Globe },
];

const testimonials = [
    {
        name: "Thibault Houdon",
        role: "Formateur et développeur Python",
        quote: "L’enseignement en ligne est en plein essor et FormaAfrique m’a permis de devenir formateur à plein temps et de partager mes connaissances et ma passion avec un nombre énorme et croissant d’étudiants à travers le monde.",
        imageId: "testimonial-samuel"
    },
    {
        name: "Sandra L",
        role: "Web & mobile développeuse et Formatrice",
        quote: "FormaAfrique offre une plateforme intuitive pour la création de cours, partager ses connaissances et développer sa communauté. En tant que formatrice depuis plusieurs années, je la recommande vivement.",
        imageId: "testimonial-fatima"
    },
    {
        name: "Jamal Lazaar",
        role: "Coach professionnel et formateur certifié",
        quote: "FormaAfrique me permet d’avoir un impact sur un grand nombre de personnes et j’aime que la plateforme s’occupe de tous les aspects techniques pour que je puisse me concentrer sur ce que je fais de mieux, c’est-à-dire enseigner.",
        imageId: "instructor-david"
    }
];


export default function BecomeInstructorPage() {
    return (
        <div className="bg-background">
            {/* Hero Section */}
            <section className="bg-primary/10 py-20 text-center">
                <div className="container px-4">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Ayez un impact global</h1>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        Construisez votre cours en ligne et monétisez votre expertise en partageant votre savoir partout dans le monde.
                    </p>
                    <Button size="lg" className="mt-8" asChild>
                        <Link href="/login?tab=signup">Devenir formateur</Link>
                    </Button>
                </div>
            </section>

            {/* Reasons to start */}
            <section className="py-16 sm:py-24">
                <div className="container px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold font-headline">Il y a tant de raisons de se lancer</h2>
                    </div>
                    <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
                        <div className="flex flex-col items-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <Lightbulb className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">Créez des cours qui vous ressemblent</h3>
                            <p className="mt-2 text-muted-foreground">
                                Publiez le cours que vous voulez, comme vous voulez, et gardez toujours le contrôle sur votre propre contenu.
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                             <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <Rocket className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">Inspirez les participants</h3>
                            <p className="mt-2 text-muted-foreground">
                                Enseignez ce que vous savez et aidez les participants à explorer leurs intérêts, à acquérir de nouvelles compétences et à faire progresser leur carrière.
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                             <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <Award className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">Soyez récompensé</h3>
                            <p className="mt-2 text-muted-foreground">
                                Développez votre réseau professionnel et votre expertise, et gagnez de l'argent pour chaque inscription payante.
                            </p>
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
                     <h2 className="text-3xl font-bold font-headline">Vous n'aurez pas à vous lancer tout seul</h2>
                     <p className="mt-4 text-lg text-muted-foreground">
                        Notre équipe de support est là pour répondre à vos questions et vérifier votre vidéo test, tandis que notre Teaching Center vous offre de nombreuses ressources pour vous aider tout au long du processus. De plus, bénéficiez du soutien de formateurs expérimentés dans notre communauté en ligne.
                     </p>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 text-center">
                 <div className="container px-4">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">Devenez formateur dès aujourd'hui</h2>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        Rejoignez l'une des plus grandes plates-formes d'apprentissage en ligne au monde.
                    </p>
                    <Button size="lg" className="mt-8" asChild>
                        <Link href="/login?tab=signup">Commencer</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
