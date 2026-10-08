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

export default function EmbeddingBackfillNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="size-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Backfill not found</CardTitle>
          <CardDescription>
            This backfill run does not exist or was removed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/embeddings/backfills">Back to backfills</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
