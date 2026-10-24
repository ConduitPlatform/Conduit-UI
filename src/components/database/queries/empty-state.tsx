import type { ReactNode } from 'react';
import { Database } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

interface QueryEmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function QueryEmptyState({
  title = 'No query selected',
  description = 'Select a query from the list or create a new one.',
  action,
  className,
}: QueryEmptyStateProps) {
  return (
    <EmptyState
      icon={Database}
      title={title}
      description={description}
      action={action}
      className={cn('h-full', className)}
    />
  );
}
