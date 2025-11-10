
'use client';

import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ChatList from './chat-list';

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-full md:w-80 lg:w-96 border-r flex-shrink-0">
        <ChatList />
      </aside>
      <main className="flex-1 h-screen overflow-hidden hidden md:block">
        {children}
      </main>
    </div>
  );
}
