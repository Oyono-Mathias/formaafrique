'use client'

import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useUser } from "@/firebase";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const noHeaderFooterRoutes = [
    '/login',
    '/dashboard',
    '/admin',
    '/formateur',
    '/messages'
];

export function NextLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, userProfile, loading } = useUser();
    const router = useRouter();

    const isAppSection = noHeaderFooterRoutes.some(route => pathname.startsWith(route));

    // This effect handles redirection for logged-in users on public pages
    useEffect(() => {
        if (!loading && user && userProfile && !isAppSection) {
             if (pathname === '/') {
                switch (userProfile.role) {
                    case 'admin':
                        router.replace('/admin');
                        break;
                    case 'formateur':
                        router.replace('/formateur');
                        break;
                    case 'etudiant':
                    default:
                        router.replace('/dashboard');
                }
             }
        }
    }, [user, userProfile, loading, router, pathname, isAppSection]);


    // If the user is logged-in but we are still figuring out their role,
    // and they land on a public page, show a loader to prevent flicker.
    if (user && loading && !isAppSection) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className='ml-3'>Chargement de votre session...</p>
            </div>
        );
    }
    
    // For public pages, show header and footer
    if (!isAppSection) {
        return (
            <>
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
            </>
        )
    }

    // For app sections (dashboard, admin, etc.), just render the children
    return <>{children}</>;
}
