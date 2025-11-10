
'use client'

import { usePathname } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const noHeaderFooterRoutes = [
    '/login',
    '/dashboard',
    '/admin',
    '/formateur',
    '/messages',
    '/courses/', // Covers all dynamic course and module pages
];

export function NextLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isAppSection = noHeaderFooterRoutes.some(route => pathname.startsWith(route));
    
    if (!isAppSection) {
        return (
            <>
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
            </>
        )
    }

    return <>{children}</>;
}
