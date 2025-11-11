
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

/**
 * @component AdminLayout
 * @description Layout de sécurité pour l'espace administrateur.
 * Vérifie que l'utilisateur est bien un 'admin'.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (userProfile && userProfile.role !== 'admin') {
        // Redirige si l'utilisateur n'est pas un admin
        router.push('/dashboard');
      }
    }
  }, [user, userProfile, loading, router]);

  // Affiche un loader pendant la vérification
  if (loading || !user || !userProfile || userProfile.role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Vérification de l'accès Administrateur...</p>
      </div>
    );
  }

  // Affiche le contenu si l'utilisateur est autorisé
  return <>{children}</>;
}
