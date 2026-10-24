import { Skeleton } from '@/components/ui/skeleton';

export default function EmbeddingBackfillDetailLoading() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}
