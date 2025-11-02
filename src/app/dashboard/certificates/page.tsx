import Link from 'next/link';
import { Download, Eye } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { users, courses } from '@/lib/mock-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function MyCertificatesPage() {
  const user = users[0];
  // Mock: assume one course is completed
  const completedCourses = courses.filter(c => c.id === 'business-plan'); 

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Mes Certificats</h1>
        <p className="text-muted-foreground">
          Vos réalisations et certificats de fin de formation.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Formation</TableHead>
                <TableHead className="hidden md:table-cell">Catégorie</TableHead>
                <TableHead className="hidden sm:table-cell">Date d'obtention</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedCourses.length > 0 ? (
                completedCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell className="hidden md:table-cell">{course.category}</TableCell>
                    <TableCell className="hidden sm:table-cell">15 Juin 2024</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button asChild variant="outline" size="icon">
                          <Link href={`/dashboard/certificate/${course.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Voir</span>
                          </Link>
                        </Button>
                        <Button asChild variant="secondary" size="icon">
                           <Link href={`/dashboard/certificate/${course.id}`}>
                            <Download className="h-4 w-4" />
                             <span className="sr-only">Télécharger</span>
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    Vous n'avez aucun certificat pour le moment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
