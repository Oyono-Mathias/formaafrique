'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Lightbulb, Rocket, Users, Target, BarChart, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';

export default function AboutPage() {
  const founderImage = PlaceHolderImages.find((img) => img.id === 'instructor-yann');
  const { t } = useLanguage();

  const stats = [
    { label: t('about_stats_learners'), value: "+10,000", icon: Users },
    { label: t('about_stats_courses'), value: "+150", icon: Rocket },
    { label: t('about_stats_countries'), value: "25+", icon: Globe },
    { label: t('about_stats_success'), value: "92%", icon: BarChart },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="bg-primary/10 py-20 text-center">
        <div className="container px-4">
          <Target className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{t('about_mission_title')}</h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            {t('about_mission_subtitle')}
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline mb-4">{t('about_story_title')}</h2>
              <div className="prose prose-lg max-w-none text-foreground/90 space-y-4">
                <p>
                  {t('about_story_p1')}
                </p>
                <p>
                  {t('about_story_p2')}
                </p>
                <p>
                  {t('about_story_p3')}
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              {founderImage && (
                <Image
                  src={founderImage.imageUrl}
                  alt={t('about_founder_alt')}
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
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">{t('about_impact_title')}</h2>
            <p className="mt-4 text-lg text-foreground/70">
              {t('about_impact_subtitle')}
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
           <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">{t('about_vision_title')}</h2>
            <p className="mt-4 text-lg text-foreground/80">
                {t('about_vision_p1')}
            </p>
             <blockquote className="border-l-4 border-primary pl-6 py-4 bg-muted rounded-r-lg my-8 text-left max-w-xl mx-auto">
                <p className="text-xl italic text-foreground/80">
                    “{t('about_vision_quote')}”
                </p>
                 <footer className="text-right mt-2 font-semibold text-primary">— {t('about_vision_quote_author')}</footer>
            </blockquote>
        </div>
      </section>

    </div>
  );
}
