import { Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <div>
      <section className="bg-primary text-primary-foreground py-20 text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl sm:text-5xl font-bold font-headline">Contactez-nous</h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-primary-foreground/80">
            Nous sommes là pour vous aider. Une question ? Une suggestion ? N'hésitez pas.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Envoyez-nous un message</CardTitle>
                  <CardDescription>
                    Notre équipe vous répondra dans les plus brefs délais.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom complet</Label>
                        <Input id="name" placeholder="Jean Dupont" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Adresse email</Label>
                        <Input id="email" type="email" placeholder="votre@email.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Sujet</Label>
                      <Input id="subject" placeholder="Sujet de votre message" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Tapez votre message ici." rows={5} />
                    </div>
                    <Button type="submit" size="lg">Envoyer le message</Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold font-headline text-primary">Nos coordonnées</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="p-3 bg-primary/10 rounded-full mr-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Email</h3>
                    <p className="text-muted-foreground">Pour toute question générale.</p>
                    <a href="mailto:contact@formaafrique.com" className="text-primary hover:underline">
                      contact@formaafrique.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-3 bg-primary/10 rounded-full mr-4">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Téléphone</h3>
                    <p className="text-muted-foreground">Disponible du Lundi au Vendredi, 9h-17h.</p>
                    <a href="tel:+221338000000" className="text-primary hover:underline">
                      +221 33 800 00 00
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-3 bg-primary/10 rounded-full mr-4">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Bureau</h3>
                    <p className="text-muted-foreground">
                      123 Avenue de l'Innovation<br/>
                      Dakar, Sénégal
                    </p>
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
