import { Skeleton } from '@/components/ui/skeleton';

export default function QueryEditorLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
        <Skeleton className="h-80 w-full rounded-lg" />
        <Skeleton className="h-80 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg md:col-span-2" />
      </div>
    </div>
  );
}
