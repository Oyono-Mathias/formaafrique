import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseProvider } from '@/firebase/client-provider';
import { UserProvider } from '@/firebase';
import { LanguageProvider } from '@/contexts/language-context';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'FormaAfrique',
  description: 'Apprentissage et formation en ligne pour l’Afrique.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        <FirebaseProvider>
          <UserProvider>
            <LanguageProvider>
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
              <Toaster />
            </LanguageProvider>
          </UserProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}