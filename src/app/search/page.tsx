
'use client';

import { Search, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { categories } from '@/lib/categories';
import Link from 'next/link';

const popularSearches = [
  'python', 'excel', 'java', 'power bi', 'sql', 'digital marketing', 
  'javascript', 'aws', 'sap', 'react', 'ai', 'c#'
];

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Rechercher des formations..."
          className="pl-10 h-12 text-lg"
        />
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4">Recherches populaires</h2>
        <div className="flex flex-wrap gap-3">
          {popularSearches.map((term) => (
            <Button key={term} variant="outline" className="rounded-full">
              {term}
            </Button>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="text-xl font-bold mb-4">Parcourir les catégories</h2>
        <div className="space-y-2">
            {categories.map((category) => (
                <Link key={category} href={`/courses?category=${encodeURIComponent(category)}`} className="block">
                    <div className="flex justify-between items-center p-4 rounded-lg hover:bg-muted transition-colors">
                        <span className="text-lg font-medium">{category}</span>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
