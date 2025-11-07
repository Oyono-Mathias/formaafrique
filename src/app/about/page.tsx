
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Lightbulb, Rocket, Quote } from 'lucide-react';

export default function AboutPage() {
  const founderImage = PlaceHolderImages.find((img) => img.id === 'instructor-yann');

  return (
    <div className="bg-primary/5 py-12 md:py-20">
      <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-xl p-6 md:p-10">

        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-primary font-headline mb-2">
            👤 À propos du fondateur — <span className="text-green-600">M. Oyono Mathias</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Fondateur de <strong>Formafrique</strong> — Entrepreneur digital, créateur no-code et passionné par la formation africaine.
          </p>
        </header>

        <section className="flex flex-wrap md:flex-nowrap items-center justify-center gap-8 md:gap-12">
          <div className="flex-shrink-0 text-center">
            {founderImage && (
              <Image
                src={founderImage.imageUrl}
                alt="Fondateur Formafrique, M. Oyono Mathias"
                width={250}
                height={250}
                className="rounded-full object-cover border-4 border-green-600 shadow-lg mx-auto"
                data-ai-hint={founderImage.imageHint}
              />
            )}
          </div>
          <div className="flex-grow prose prose-lg max-w-none text-foreground/90">
            <p>
              Fondateur et concepteur de <strong>Formafrique</strong>, <strong>M. Oyono Mathias</strong> est un entrepreneur camerounais et centrafricain passionné par le digital, l’éducation et le développement personnel.
              Son parcours illustre la <strong>détermination</strong>, la <strong>curiosité</strong> et la <strong>soif d’apprendre</strong> qui animent la jeunesse africaine.
            </p>
            <p>
              Au départ, il n’était pas développeur web. Ses débuts se résumaient à <strong>copier-coller des lignes de code</strong> sans tout comprendre.
              Mais animé par la passion d’apprendre, il a décidé de comprendre le rôle de chaque balise, chaque style, et chaque fonction.
              Grâce à sa persévérance, il a appris à créer ses propres sites web à partir de son <strong>téléphone Android</strong> avec l’application <strong>TrebEdit</strong>.
            </p>
            <p>
              Aujourd’hui, il se définit comme un <strong>développeur no-code</strong> : un créateur qui conçoit des plateformes puissantes et fonctionnelles sans écrire de code complexe, mais en comprenant parfaitement leur fonctionnement.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold font-headline text-primary flex items-center gap-3 mb-3"><Lightbulb /> Sa vision</h2>
          <p className="prose prose-lg max-w-none text-foreground/90">
            À travers <strong>Formafrique</strong>, il veut prouver qu’avec de la volonté et de la patience, tout jeune africain peut apprendre, créer et réussir.
            Sa mission est de rendre la formation professionnelle accessible à tous, même à ceux qui n’ont ni ordinateur, ni expérience technique.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold font-headline text-primary flex items-center gap-3 mb-3"><Rocket /> Son message à la jeunesse africaine</h2>
          <blockquote className="border-l-4 border-green-600 pl-6 py-4 bg-muted rounded-r-lg my-4">
            <p className="text-lg italic text-foreground/80">
              “Je n’étais pas développeur. J’ai commencé par copier et coller, sans rien comprendre.
              Aujourd’hui, je crée mes propres sites et je partage mes connaissances.
              Si moi j’ai pu le faire, toi aussi tu peux y arriver.”
            </p>
          </blockquote>
          <p className="prose prose-lg max-w-none text-foreground/90">
            Son histoire est une source d’inspiration pour tous les jeunes africains : <strong>il n’y a pas de limites à ce qu’on peut accomplir quand on croit en soi</strong>.
          </p>
        </section>

        <footer className="text-center mt-16">
          <h3 className="text-xl md:text-2xl font-semibold text-green-600 italic">
            « Former l’Afrique d’aujourd’hui pour bâtir celle de demain. »
          </h3>
        </footer>

      </div>
    </div>
  );
}
