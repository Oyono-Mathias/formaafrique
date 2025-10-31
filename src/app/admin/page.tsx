import { Lock } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center p-4">
      <Lock className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-4xl font-bold font-headline text-primary">
        Zone Administrateur
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-md">
        Cette page est réservée aux administrateurs du site. Veuillez vous connecter avec des identifiants valides pour continuer.
      </p>
    </div>
  );
}
