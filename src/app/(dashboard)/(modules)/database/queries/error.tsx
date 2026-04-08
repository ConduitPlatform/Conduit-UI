'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function DatabaseQueriesError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className={cn(
        'flex min-h-[240px] flex-col items-center justify-center p-6',
        'text-foreground'
      )}
    >
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">
            Could not load query
          </CardTitle>
          <CardDescription className="text-pretty">
            {error.message ||
              'The editor failed to load. You can try again or return to the list.'}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-2 border-t bg-muted/30 px-4 py-4 dark:bg-muted/20">
          <Button type="button" variant="default" onClick={() => reset()}>
            Try again
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/database/queries/new">Back to queries</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
