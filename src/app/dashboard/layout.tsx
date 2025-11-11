
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

/**
 * @component DashboardLayout
 * @description Layout de sécurité pour l'espace étudiant.
 * Vérifie que l'utilisateur est connecté.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion.
      router.push('/login');
    }
  }, [user, loading, router]);

  // Pendant que les informations sont chargées, afficher un loader.
  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Chargement de votre espace...</p>
      </div>
    );
  }

  // Si tout est en ordre, afficher le contenu de la page demandée.
  return <>{children}</>;
}
