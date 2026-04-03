import { Skeleton } from '@/components/ui/skeleton';

export default function ModelDetailLoading() {
  return (
    <div className="flex flex-col h-full w-full p-6 gap-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-10 w-72" />

      {/* Content skeleton */}
      <div className="flex-1 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
