
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/firebase"; // Assurez-vous que ce hook existe
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

/**
 * @component FormateurGuard
 * @description Un composant "Higher-Order" qui encapsule des pages pour s'assurer
 * que seul un utilisateur avec le rôle "formateur" peut y accéder.
 *
 * @props { children: React.ReactNode } - Le contenu à afficher si l'utilisateur est autorisé.
 * @hooks
 *  - useUser: Pour vérifier le statut et le rôle de l'utilisateur.
 *  - useRouter: Pour effectuer la redirection si nécessaire.
 *  - useEffect: Pour déclencher la vérification.
 * @firestore Non (la logique est dans le hook `useUser`).
 * @ux
 *  - Transparent si l'utilisateur est autorisé.
 *  - Affiche un loader pendant la vérification.
 *  - Redirige et affiche un toast d'erreur si l'accès est refusé.
 */
export default function FormateurGuard({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (userProfile && userProfile.role !== "formateur") {
        toast({
            variant: "destructive",
            title: "Accès refusé",
            description: "Vous n'avez pas les permissions pour accéder à cette page."
        });
        router.push("/dashboard");
      }
    }
  }, [user, userProfile, loading, router]);

  if (loading || !userProfile || userProfile.role !== 'formateur') {
      return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-3">Vérification de l'accès formateur...</p>
        </div>
      );
  }

  return <>{children}</>;
}
