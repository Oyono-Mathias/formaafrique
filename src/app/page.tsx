
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { FirebaseProvider } from "@/firebase/client-provider";
import { LanguageProvider } from "@/contexts/language-context";
import { UserProvider } from "@/firebase";

export default function Home() {
  return (
    <FirebaseProvider>
        <UserProvider>
            <LanguageProvider>
                <Header />
                <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Bienvenue sur FormaAfrique 🎓</h1>
                    <p className="text-gray-600">Apprenez, enseignez et grandissez avec les formations africaines.</p>
                </main>
                <Footer />
            </LanguageProvider>
        </UserProvider>
    </FirebaseProvider>
  );
}
