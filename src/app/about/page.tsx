import Image from 'next/image';
import { Check, Target, Eye, Users, Heart } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  const aboutImage = PlaceHolderImages.find((img) => img.id === 'about-us');
  const team = [
    { name: 'Yannick Noah', title: 'CEO & Co-fondateur', avatarId: 'instructor-yann' },
    { name: 'Aisha Keita', title: 'Directrice Pédagogique', avatarId: 'instructor-aisha' },
    { name: 'David Okoro', title: 'Responsable Partenariats', avatarId: 'instructor-david' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 md:py-28 text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl sm:text-5xl font-bold font-headline">À propos de FormaAfrique</h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-primary-foreground/80">
            Une plateforme panafricaine de formation gratuite et inclusive, visant à autonomiser les jeunes, femmes et entrepreneurs à travers l’éducation numérique.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold font-headline text-primary mb-4">Notre Histoire</h2>
              <div className="prose max-w-none text-lg">
                <p>
                  FormaAfrique est né d'une conviction simple : le talent est partout en Afrique, mais les opportunités ne le sont pas. Frustrés par le manque d'accès à une formation de haute qualité adaptée aux réalités du continent, nos fondateurs ont décidé d'agir.
                </p>
                <p>
                  Lancée en 2023, notre plateforme a pour but de combler ce fossé en connectant les esprits les plus brillants d'Afrique avec des connaissances de pointe, enseignées par des experts locaux. Nous croyons en un apprentissage pratique, pertinent et qui ouvre des portes concrètes sur le marché du travail.
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              {aboutImage && (
                <Image
                  src={aboutImage.imageUrl}
                  alt={aboutImage.description}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl"
                  data-ai-hint={aboutImage.imageHint}
                />
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Mission, Vision, Values */}
      <section className="py-16 sm:py-24 bg-primary/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <Target className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="mt-4 font-headline text-center">Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p>Rendre la formation professionnelle accessible à tous, même sans connexion Internet constante.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Eye className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="mt-4 font-headline text-center">Vision</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p>Faire de l’Afrique un continent d’innovateurs et de créateurs autonomes.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold font-headline text-primary">Notre Équipe Fondatrice</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Une équipe passionnée et engagée pour votre réussite.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member) => {
              const memberAvatar = PlaceHolderImages.find(img => img.id === member.avatarId);
              return (
                <div key={member.name} className="flex flex-col items-center">
                  <Avatar className="w-32 h-32 mb-4">
                    {memberAvatar && <AvatarImage src={memberAvatar.imageUrl} alt={member.name} />}
                    <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-primary">{member.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="bg-primary/10 py-16 sm:py-24">
          <div className="container mx-auto px-4 md:px-6 text-center">
              <h2 className="text-3xl font-bold font-headline text-primary">Soutenez Notre Mission</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                  Votre contribution, quelle qu'elle soit, nous aide à maintenir la gratuité et la qualité de nos formations pour des milliers d'apprenants à travers le continent.
              </p>
              <div className="mt-8">
                  <Button size="lg" asChild>
                      <Link href="/donate">
                          <Heart className="mr-2 h-5 w-5" /> Nous soutenir
                      </Link>
                  </Button>
              </div>
          </div>
      </section>
    </div>
  );
}
