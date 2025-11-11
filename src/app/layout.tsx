
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseProvider } from '@/firebase/client-provider';
import { UserProvider } from '@/firebase';
import { LanguageProvider } from '@/contexts/language-context';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'FormaAfrique',
  description: "Plateforme d'apprentissage en ligne pour l'Afrique.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <FirebaseProvider>
          <UserProvider>
            <LanguageProvider>
              {children}
              <Toaster />
            </LanguageProvider>
          </UserProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
