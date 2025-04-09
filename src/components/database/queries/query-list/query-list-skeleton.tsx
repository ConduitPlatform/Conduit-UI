import { Skeleton } from '@/components/ui/skeleton';

export function QueryListSkeleton() {
  return (
    <div className="flex items-center p-3 mb-2 rounded-md">
      <Skeleton className="w-4 h-4 mr-2" />
      <div className="flex-1">
        <Skeleton className="h-5 w-3/4 mb-1" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  );
}
