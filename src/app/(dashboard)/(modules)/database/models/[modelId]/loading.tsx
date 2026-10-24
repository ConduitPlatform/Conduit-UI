import { Skeleton } from '@/components/ui/skeleton';

export default function ModelDetailLoading() {
  return (
    <div className="flex flex-col h-full w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      <Skeleton className="h-8 w-64 rounded-md" />

      <div className="flex-1 grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    </div>
  );
}
