'use client'

import { usePathname } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const noHeaderFooterRoutes = [
    '/login',
    '/dashboard',
    '/admin',
    '/formateur',
    '/messages'
];

export function NextLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const showHeaderFooter = !noHeaderFooterRoutes.some(route => pathname.startsWith(route));

    if (showHeaderFooter) {
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
