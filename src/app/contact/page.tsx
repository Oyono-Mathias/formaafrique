import { Mail, Phone, MapPin, Facebook, Linkedin, MessageCircle } from 'lucide-react';
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
                    <a href="mailto:contact@formaafrique.org" className="text-primary hover:underline">
                      contact@formaafrique.org
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-3 bg-primary/10 rounded-full mr-4">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Téléphone</h3>
                    <a href="tel:+237677000000" className="text-primary hover:underline">
                      +237 6 77 00 00 00
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-3 bg-primary/10 rounded-full mr-4">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Adresse</h3>
                    <p className="text-muted-foreground">
                      Yaoundé, Cameroun
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                 <h3 className="text-lg font-semibold">Suivez-nous</h3>
                 <div className="flex space-x-4">
                    <a href="#" className="text-muted-foreground hover:text-primary"><Facebook className="w-6 h-6" /></a>
                    <a href="#" className="text-muted-foreground hover:text-primary"><MessageCircle className="w-6 h-6" /></a>
                    <a href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="w-6 h-6" /></a>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
