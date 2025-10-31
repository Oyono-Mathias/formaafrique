import Image from 'next/image';
import { Heart, BookOpen, User, DollarSign } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function DonationPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'donate-hero');

  return (
    <div>
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 bg-primary/10">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover z-0"
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/50 z-0"></div>
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <Heart className="mx-auto h-12 w-12 text-white mb-4" />
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl font-headline">
              Soutenez l'éducation en Afrique
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-200">
              Votre don permet de créer des opportunités et de transformer des vies à travers le continent.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Donation Form */}
            <div>
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Faire un don</CardTitle>
                  <CardDescription>Chaque contribution compte, petite ou grande.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="h-12 text-lg">10 €</Button>
                      <Button variant="outline" className="h-12 text-lg">25 €</Button>
                      <Button variant="outline" className="h-12 text-lg">50 €</Button>
                      <Button variant="outline" className="h-12 text-lg">100 €</Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-lg">Ou un autre montant</Label>
                       <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="amount" type="number" placeholder="Montant personnalisé" className="h-12 text-lg pl-10" />
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button size="lg" className="w-full text-lg h-14">
                    Faire un don avec Flutterwave
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Impact Section */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
                Comment votre don aide-t-il ?
              </h2>
              <p className="text-lg text-foreground/80">
                Votre générosité nous permet de maintenir nos cours accessibles, de développer de nouveaux contenus et de fournir un soutien technologique à nos étudiants.
              </p>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="p-3 bg-accent/20 rounded-full mr-4">
                    <BookOpen className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Création de cours</h3>
                    <p className="text-muted-foreground">Financez le développement de nouvelles formations dans des domaines à fort potentiel.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-3 bg-accent/20 rounded-full mr-4">
                    <User className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Bourses d'études</h3>
                    <p className="text-muted-foreground">Offrez un accès gratuit à des étudiants talentueux mais démunis.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
