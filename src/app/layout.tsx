
import type { Metadata } from 'next';
import './globals.css';


export const metadata = {
  title: "FormaAfrique",
  description: "Plateforme de formation africaine moderne et interactive.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  console.log("✅ Layout global chargé");
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
