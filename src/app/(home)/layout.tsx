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
    // If the user profile is loaded, and the user is on the home page, redirect them to their correct dashboard.
    // This should only happen if they manually navigate to '/'.
    if (!loading && user && userProfile) {
        if (window.location.pathname === '/') {
            switch (userProfile.role) {
                case 'admin':
                    router.replace('/admin');
                    break;
                case 'formateur':
                    router.replace('/formateur');
                    break;
                case 'etudiant':
                default:
                     router.replace('/dashboard');
            }
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile, loading]);

  // If the user is logged in, but we are still determining their role, show a loading screen.
  // This prevents the public page from flashing for a logged-in user who just arrived at the site.
  if (user && loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className='ml-3'>Chargement de votre session...</p>
      </div>
    );
  }

  // If the user is not logged in, or if they are on a different public page (like /about), show the content.
  if (!user) {
    return <>{children}</>;
  }
  
  // If user is logged in but for some reason we are not redirecting yet, we can show a loader or children.
  // Showing children is safer to avoid loops if they land on e.g. /about while logged in.
  return <>{children}</>;
}
