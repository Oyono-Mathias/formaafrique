'use client';

import Link from 'next/link';
import { Globe } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { Button } from '../ui/button';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
];


export default function Footer() {
  const [isLangDialogOpen, setIsLangDialogOpen] = useState(false);
  const [currentLang] = useState('fr');

  const footerLinkGroups = [
    {
      title: 'FormaAfrique Business',
      links: [
        { label: 'Enseigner sur FormaAfrique', href: '/devenir-formateur' },
        { label: 'À propos de nous', href: '/about' },
        { label: 'Nous contacter', href: '/contact' },
      ],
    },
    {
      title: 'Carrières',
      links: [
        { label: 'Blog', href: '#' },
        { label: 'Aide et support', href: '#' },
        { label: 'Affilié', href: '#' },
        { label: 'Investisseurs', href: '#' },
      ],
    },
    {
      title: 'Conditions',
      links: [
        { label: 'Conditions d\'utilisation', href: '/privacy' },
        { label: 'Politique de confidentialité', href: '/privacy' },
        { label: 'Plan du site', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-[#1c1d1f] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {footerLinkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="font-bold text-sm tracking-wider">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-300 hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 lg:place-self-end">
            <Dialog open={isLangDialogOpen} onOpenChange={setIsLangDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 hover:text-white w-full lg:w-auto">
                        <Globe className="mr-2 h-4 w-4" />
                        Français
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white text-black">
                    <DialogHeader>
                        <DialogTitle>LANGUES</DialogTitle>
                    </DialogHeader>
                    <ul className="space-y-1 py-4">
                        {languages.map(lang => (
                            <li key={lang.code}>
                                <button className={`w-full text-left p-3 rounded-md text-lg ${currentLang === lang.code ? 'font-bold text-primary bg-primary/10' : 'hover:bg-muted'}`}>
                                    {lang.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col sm:flex-row justify-between items-center">
           <Logo className="h-8 text-white" />
          <p className="text-xs text-gray-400 mt-4 sm:mt-0">
            &copy; {new Date().getFullYear()} FormaAfrique, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
