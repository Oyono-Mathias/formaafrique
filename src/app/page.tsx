
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-center mb-4">Bienvenue sur FormaAfrique 🎓</h1>
      <p className="text-lg text-muted-foreground text-center mb-8">
        La page d'accueil est en cours de reconstruction pour corriger une erreur.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/dashboard">Accéder au Dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    </main>
  );
}
