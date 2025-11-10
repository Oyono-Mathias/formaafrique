'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

/**
 * @page ErrorBoundary Formateur
 * @description Cette page est affichée automatiquement par Next.js lorsqu'une erreur
 * se produit dans n'importe quelle page de l'espace formateur (/formateur/**).
 * Elle empêche l'application de planter et affiche un message convivial.
 *
 * @param error - L'objet d'erreur qui a été levé.
 * @param reset - Une fonction pour tenter de re-rendre le segment de route.
 */
export default function FormateurError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Affiche l'erreur dans la console pour le débogage
    console.error('--- Erreur dans le Dashboard Formateur ---');
    console.error(error);
    console.error('-----------------------------------------');
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">
          Erreur de chargement du dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Une erreur inattendue est survenue. Veuillez réessayer plus tard.
        </p>
        <Button
          onClick={() => reset()}
          className="mt-6"
        >
          Réessayer
        </Button>
      </div>
    </div>
  );
}
