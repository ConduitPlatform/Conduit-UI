import { Skeleton } from '@/components/ui/skeleton';

export default function ModelsNewLoading() {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between py-3 border-b border-border">
        <Skeleton className="h-8 w-[240px] rounded-md" />
      </div>

      <div className="flex-1 flex items-center justify-center py-8">
        <div className="max-w-lg text-center space-y-4">
          <Skeleton className="size-14 rounded-full mx-auto" />
          <Skeleton className="h-5 w-40 mx-auto" />
          <Skeleton className="h-3 w-64 mx-auto" />
          <Skeleton className="h-3 w-48 mx-auto" />
          <Skeleton className="h-8 w-32 mx-auto rounded-md" />
        </div>
      </div>
    </div>
  );
}
