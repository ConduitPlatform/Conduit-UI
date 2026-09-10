import { Skeleton } from '@/components/ui/skeleton';

export default function EmbeddingSourcesLoading() {
  return (
    <div className="flex flex-col space-y-4">
      <div className="mb-2 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
