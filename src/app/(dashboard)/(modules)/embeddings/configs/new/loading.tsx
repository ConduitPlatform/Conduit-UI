import { Skeleton } from '@/components/ui/skeleton';

export default function NewEmbeddingConfigLoading() {
  return (
    <div className="flex flex-col space-y-4 max-w-3xl">
      <div className="space-y-2 mb-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
