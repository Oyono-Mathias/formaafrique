import Link from 'next/link';
import { Github, Twitter, Linkedin, Facebook } from 'lucide-react';
import { Logo } from '@/components/icons/logo';

export default function Footer() {
  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'GitHub', icon: Github, href: '#' },
  ];

  const footerLinks = [
    {
      title: 'Formations',
      links: [
        { label: 'Développement Web', href: '/courses' },
        { label: 'Marketing Digital', href: '/courses' },
        { label: 'Entrepreneuriat', href: '/courses' },
        { label: 'Data Science', href: '/courses' },
      ],
    },
    {
      title: 'Entreprise',
      links: [
        { label: 'À propos', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Admin', href: '/admin' },
      ],
    },
    {
      title: 'Légal',
      links: [
        { label: 'Politique de confidentialité', href: '/privacy' },
        { label: 'Conditions d\'utilisation', href: '/privacy' },
      ],
    },
  ];

  return (
    <footer className="bg-primary/5 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Logo />
            <p className="text-base text-muted-foreground">
              Donner à l'Afrique les moyens d'agir grâce à l'éducation.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <a key={item.name} href={item.href} className="text-muted-foreground hover:text-primary">
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
                  {footerLinks[0].title}
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks[0].links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-base text-muted-foreground hover:text-primary">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
                  {footerLinks[1].title}
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks[1].links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-base text-muted-foreground hover:text-primary">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
                  {footerLinks[2].title}
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks[2].links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-base text-muted-foreground hover:text-primary">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-base text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} FormaAfrique. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
