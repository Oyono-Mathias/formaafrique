'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
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
  }, [user, userProfile, loading, router]);

  // If loading, or if the user is logged in, show a loading screen while redirecting.
  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className='ml-3'>Redirection vers votre tableau de bord...</p>
      </div>
    );
  }

  // Only show the public layout if the user is not logged in and loading is finished.
  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
