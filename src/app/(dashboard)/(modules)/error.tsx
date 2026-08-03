'use client';

import { ErrorCard } from '@/components/error/ErrorCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ModuleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const moduleSlug = pathname.split('/')[1];

  const message = [
    error.message,
    error.digest ? `Error ID: ${error.digest}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  return (
    <ErrorCard
      title="Module Error"
      message={message}
      onRetry={reset}
      actions={
        moduleSlug ? (
          <Button variant="outline" asChild>
            <Link href={`/${moduleSlug}`}>Module Dashboard</Link>
          </Button>
        ) : undefined
      }
    />
  );
}
