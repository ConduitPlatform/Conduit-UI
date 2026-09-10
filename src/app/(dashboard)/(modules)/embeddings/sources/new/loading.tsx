import { Skeleton } from '@/components/ui/skeleton';

export default function NewEmbeddingSourceLoading() {
  return (
    <div className="flex flex-col space-y-4">
      <div className="mb-2 space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-96 w-full max-w-3xl" />
    </div>
  );
}
