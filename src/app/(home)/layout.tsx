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
  const { user, loading, userProfile } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && userProfile) {
        if (userProfile.role === 'admin') {
            router.replace('/admin');
        } else if (userProfile.role === 'formateur') {
            router.replace('/formateur');
        } else {
            router.replace('/dashboard');
        }
    }
  }, [user, userProfile, loading, router]);

  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className='ml-3'>Redirection vers votre tableau de bord...</p>
      </div>
    );
  }

  return <>{children}</>;
}
