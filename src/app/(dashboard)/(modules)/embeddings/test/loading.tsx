import { Skeleton } from '@/components/ui/skeleton';

export default function EmbeddingsTestSearchLoading() {
  return (
    <div className="flex flex-col space-y-4">
      <div className="space-y-2 mb-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
