import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseProvider } from '@/firebase/client-provider';
import { UserProvider } from '@/firebase';
import { NextLayout } from './next-layout';

const ptSans = PT_Sans({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-sans' 
});

export const metadata: Metadata = {
  title: 'FormaAfrique | Formations pour un avenir meilleur',
  description: 'FormaAfrique - Plateforme de formation africaine gratuite et intelligente.',
  keywords: 'formation, Afrique, entrepreneuriat, numérique, FormaAfrique, e-learning',
  authors: [{ name: 'OYONO MATHIAS' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn("h-full font-sans", ptSans.variable)}>
      <body className={cn('antialiased flex flex-col min-h-screen')}>
        <FirebaseProvider>
          <UserProvider>
            <NextLayout>
              {children}
            </NextLayout>
            <Toaster />
          </UserProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
