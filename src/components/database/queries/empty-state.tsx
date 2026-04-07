import { Database } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export function QueryEmptyState() {
  return (
    <EmptyState
      icon={Database}
      title="No Query Selected"
      description="Select a query from the list or create a new one"
      className="h-full"
    />
  );
}
