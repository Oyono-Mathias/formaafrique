import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { FirebaseProvider } from '@/firebase/client-provider';
import { UserProvider } from '@/firebase';

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
    <html lang="fr" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased flex flex-col min-h-screen')}>
        <FirebaseProvider>
          <UserProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster />
          </UserProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
