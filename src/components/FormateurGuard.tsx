"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/firebase";
import { toast } from "@/hooks/use-toast";

export default function FormateurGuard({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (userProfile && userProfile.role !== "formateur") {
        // Redirect to a general access-denied or home page
        // to avoid loops if they land on a wrong dashboard.
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
            <div>Chargement...</div>
        </div>
      );
  }

  return <>{children}</>;
}
