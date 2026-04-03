import { Skeleton } from '@/components/ui/skeleton';

export default function ModelsNewLoading() {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-[280px]" />
        </div>
      </div>

      {/* Welcome content skeleton */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg text-center space-y-6">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-72 mx-auto" />
          <Skeleton className="h-4 w-56 mx-auto" />
          <Skeleton className="h-10 w-40 mx-auto" />
        </div>
      </div>
    </div>
  );
}
