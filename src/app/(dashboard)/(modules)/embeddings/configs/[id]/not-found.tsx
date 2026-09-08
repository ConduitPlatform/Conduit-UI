import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function EmbeddingConfigNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="size-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Config not found</CardTitle>
          <CardDescription>
            This embedding configuration does not exist or was deleted. Vector
            fields and indexes on the schema are retained.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/embeddings/configs">Back to configs</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
