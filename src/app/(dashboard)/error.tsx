'use client';

import { ErrorCard } from '@/components/error/ErrorCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Dashboard Error"
      message={error.message}
      onRetry={reset}
      actions={
        <Button variant="outline" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      }
    />
  );
}
