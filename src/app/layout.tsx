
import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseProvider } from '@/firebase/client-provider';
import { UserProvider } from '@/firebase';
import { LanguageProvider } from '@/contexts/language-context';

const ptSans = PT_Sans({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-sans' 
});

export const metadata: Metadata = {
  title: 'FormaAfrique | Formations pour un avenir meilleur',
  description: 'FormaAfrique - Plateforme de formation africaine gratuite et intelligente.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("RootLayout chargé");
  return (
    <html lang="fr" className={cn("h-full font-sans", ptSans.variable)}>
      <body suppressHydrationWarning={true}>
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
