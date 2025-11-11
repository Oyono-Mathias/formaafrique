import type { Metadata } from 'next';

export const metadata = {
  title: "FormaAfrique",
  description: "Apprentissage et formation en ligne pour l’Afrique.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  console.log("✅ Layout principal chargé");
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
