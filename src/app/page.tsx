
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <h1 className="text-5xl font-extrabold text-blue-800 mb-4">Bienvenue sur FormaAfrique 🎓</h1>
        <p className="text-gray-600 text-lg">Votre plateforme africaine d’apprentissage et d’opportunités.</p>
      </main>
      <Footer />
    </>
  );
}
