'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // We only redirect if loading is complete and we have a user and their profile
    if (!loading && user && userProfile) {
        switch (userProfile.role) {
            case 'admin':
                router.replace('/admin');
                break;
            case 'formateur':
                router.replace('/formateur');
                break;
            case 'etudiant':
                router.replace('/dashboard');
                break;
            default:
                 router.replace('/dashboard'); // Fallback to student dashboard
        }
    }
  // No dependency on router to avoid re-triggering on navigation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile, loading]);

  // While loading, or if a user is logged in but their profile is not yet loaded,
  // show a loading screen. This prevents the public content from flashing before redirection.
  if (loading || (user && !userProfile)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className='ml-3'>Redirection vers votre tableau de bord...</p>
      </div>
    );
  }

  // Only show public content if not loading and no user is logged in.
  if (!user) {
     return <>{children}</>;
  }

  // If user is logged in but redirection hasn't happened yet, show loader
  return (
     <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className='ml-3'>Redirection en cours...</p>
      </div>
  );
}
