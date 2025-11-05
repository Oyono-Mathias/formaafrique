import Link from 'next/link';
import { Github, Twitter, Linkedin, Facebook, MessageCircle } from 'lucide-react';
import { Logo } from '@/components/icons/logo';

export default function Footer() {
  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'WhatsApp', icon: MessageCircle, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ];

  const footerLinks = [
    {
      title: 'Formations',
      links: [
        { label: 'Toutes les formations', href: '/courses' },
        { label: 'Nos Formateurs', href: '/instructors' },
        { label: 'Entrepreneuriat', href: '/courses' },
        { label: 'Compétences numériques', href: '/courses' },
      ],
    },
    {
      title: 'FormaAfrique',
      links: [
        { label: 'À propos', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Faire un don', href: '/donate' },
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
    <footer className="bg-dark-grey-custom text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Logo className="text-white" />
            <p className="text-base text-gray-300">
              Donner à l'Afrique les moyens d'agir grâce à l'éducation.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <a key={item.name} href={item.href} className="text-gray-300 hover:text-yellow-custom">
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase text-white">
                  {footerLinks[0].title}
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks[0].links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-base text-yellow-custom hover:underline">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold tracking-wider uppercase text-white">
                  {footerLinks[1].title}
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks[1].links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-base text-yellow-custom hover:underline">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase text-white">
                  {footerLinks[2].title}
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks[2].links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-base text-yellow-custom hover:underline">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-300 text-center">
            &copy; {new Date().getFullYear()} FormaAfrique. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
