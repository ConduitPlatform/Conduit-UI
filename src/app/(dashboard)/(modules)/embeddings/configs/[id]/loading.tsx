import { Skeleton } from '@/components/ui/skeleton';

export default function EmbeddingConfigDetailLoading() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
