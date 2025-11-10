
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase"; // Hook personnalisé à créer
import { Loader2 } from "lucide-react";

/**
 * @component FormateurLayout
 * @description Layout principal et garde de sécurité pour toutes les pages de l'espace formateur.
 * Il vérifie si l'utilisateur est authentifié et a le rôle "formateur" avant d'afficher le contenu.
 *
 * @props { children: React.ReactNode } - Les pages enfants à afficher si l'authentification réussit.
 * @hooks
 *  - useUser: Pour obtenir l'état de l'utilisateur et son profil.
 *  - useRouter: Pour rediriger les utilisateurs non autorisés.
 *  - useEffect: Pour exécuter la logique de vérification après le rendu.
 * @firestore Non applicable (la logique est dans le hook `useUser`).
 * @ux
 *  - Affiche un écran de chargement global pendant la vérification.
 *  - Redirige de manière transparente vers la page de connexion si l'accès est refusé.
 *  - Contient la structure de navigation latérale et l'en-tête commun à l'espace formateur.
 */
export default function FormateurLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion.
        router.push("/login");
      } else if (userProfile && userProfile.role !== "formateur") {
        // Si l'utilisateur est connecté mais n'est pas un formateur, rediriger.
        // Idéalement, vers une page "accès refusé" ou le dashboard étudiant.
        router.push("/dashboard");
      }
      // Si l'utilisateur est un formateur, il reste sur la page.
    }
  }, [user, userProfile, loading, router]);

  // Pendant que les informations sont chargées, afficher un loader.
  if (loading || !user || !userProfile || userProfile.role !== 'formateur') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Vérification de l'accès...</p>
      </div>
    );
  }

  // Si tout est en ordre, afficher le contenu de la page demandée.
  return (
    <div>
        {/* Ici, nous ajouterions la barre de navigation latérale et l'en-tête */}
        <main>{children}</main>
    </div>
  );
}
