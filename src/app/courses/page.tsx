import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ListFilter, Search, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { courses } from '@/lib/mock-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function CoursesPage() {
  const categories = [...new Set(courses.map(c => c.category))];

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="space-y-4 mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl font-headline">
          Toutes nos formations
        </h1>
        <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
          Explorez notre catalogue complet et trouvez le cours qui correspond à vos ambitions.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Rechercher une formation..." className="pl-10" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <ListFilter className="mr-2 h-4 w-4" />
              Filtrer par catégorie
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Catégories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value="all">
              <DropdownMenuRadioItem value="all">Toutes</DropdownMenuRadioItem>
              {categories.map(cat => (
                 <DropdownMenuRadioItem key={cat} value={cat.toLowerCase()}>{cat}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((course) => {
          const courseImage = PlaceHolderImages.find((img) => img.id === course.imageId);
          return (
            <Card key={course.id} className="flex flex-col overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader className="p-0">
                <Link href={`/courses/${course.id}`} className="block aspect-video relative">
                  {courseImage && (
                    <Image
                      src={courseImage.imageUrl}
                      alt={course.title}
                      fill
                      className="object-cover"
                      data-ai-hint={courseImage.imageHint}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}
                </Link>
              </CardHeader>
              <CardContent className="flex-grow p-6">
                <Badge variant="secondary" className="mb-2">{course.category}</Badge>
                <CardTitle className="text-xl font-headline leading-tight hover:text-primary">
                  <Link href={`/courses/${course.id}`}>{course.title}</Link>
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{course.shortDescription}</p>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{course.enrollmentCount} inscrits</span>
                </div>
                <Button asChild variant="link" size="sm">
                  <Link href={`/courses/${course.id}`}>Détails <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
