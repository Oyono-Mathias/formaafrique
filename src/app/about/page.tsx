
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Lightbulb, Rocket, Users, Target, BarChart, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  const founderImage = PlaceHolderImages.find((img) => img.id === 'instructor-yann');

  const stats = [
    { label: "Apprenants passionnés", value: "+10,000", icon: Users },
    { label: "Formations d'experts", value: "+150", icon: Rocket },
    { label: "Pays touchés", value: "25+", icon: Globe },
    { label: "Taux de réussite", value: "92%", icon: BarChart },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="bg-primary/10 py-20 text-center">
        <div className="container px-4">
          <Target className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Notre Mission</h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            Rendre l'éducation de qualité accessible à tous en Afrique, en fournissant les compétences nécessaires pour construire l'avenir du continent.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline mb-4">Notre Histoire</h2>
              <div className="prose prose-lg max-w-none text-foreground/90 space-y-4">
                <p>
                  L'histoire de <strong>FormaAfrique</strong> est celle de la passion et de la persévérance. Elle commence avec son fondateur, <strong>M. Oyono Mathias</strong>, un entrepreneur camerounais et centrafricain animé par une soif d'apprendre insatiable.
                </p>
                <p>
                  Sans formation de développeur, il a débuté en assemblant des lignes de code, mû par la curiosité de comprendre leur fonctionnement. Armé de son seul téléphone Android, il a appris à créer des sites web, transformant sa détermination en compétence.
                </p>
                <p>
                  De cette expérience est née une conviction : avec les bons outils et de la volonté, chaque jeune Africain peut surmonter les barrières techniques et réaliser son potentiel. <strong>FormaAfrique a été créée sur ce principe fondamental.</strong>
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              {founderImage && (
                <Image
                  src={founderImage.imageUrl}
                  alt="Fondateur Formafrique, M. Oyono Mathias"
                  width={350}
                  height={350}
                  className="rounded-full object-cover border-8 border-primary/20 shadow-xl"
                  data-ai-hint={founderImage.imageHint}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="bg-muted py-16 sm:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">Notre Impact</h2>
            <p className="mt-4 text-lg text-foreground/70">
              Nous sommes fiers de contribuer au développement des compétences sur tout le continent.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center bg-card shadow-lg hover:shadow-primary/20 transition-shadow">
                <CardHeader className="flex flex-col items-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-2">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-4xl font-bold">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Vision Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
           <Lightbulb className="mx-auto h-12 w-12 text-primary mb-4" />
           <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">Notre Vision</h2>
            <p className="mt-4 text-lg text-foreground/80">
                Nous aspirons à un avenir où chaque Africain a le pouvoir de transformer sa vie et sa communauté grâce à une éducation accessible et de classe mondiale. Nous voulons être le catalyseur qui libère le potentiel de millions de personnes, en formant les leaders, les innovateurs et les créateurs de demain.
            </p>
             <blockquote className="border-l-4 border-primary pl-6 py-4 bg-muted rounded-r-lg my-8 text-left max-w-xl mx-auto">
                <p className="text-xl italic text-foreground/80">
                    “Si moi j’ai pu le faire, toi aussi tu peux y arriver. Il n’y a pas de limites à ce qu’on peut accomplir quand on croit en soi.”
                </p>
                 <footer className="text-right mt-2 font-semibold text-primary">— M. Oyono Mathias, Fondateur</footer>
            </blockquote>
        </div>
      </section>

    </div>
  );
}
