
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { Loader2 } from "lucide-react";

/**
 * @component FormateurLayout
 * @description Layout de sécurité pour l'espace formateur.
 * Vérifie que l'utilisateur a bien le rôle "formateur".
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
        router.push("/dashboard");
      }
    }
  }, [user, userProfile, loading, router]);

  // Pendant que les informations sont chargées, afficher un loader.
  if (loading || !user || !userProfile || userProfile.role !== 'formateur') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Vérification de l'accès Formateur...</p>
      </div>
    );
  }

  // Si tout est en ordre, afficher le contenu de la page demandée.
  return <>{children}</>;
}
