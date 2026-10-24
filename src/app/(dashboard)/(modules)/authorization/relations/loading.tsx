import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="flex items-center gap-4 px-3 py-2 border-b border-border">
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
        <div className="flex items-center gap-4 px-3 py-2 border-b border-border">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20 ml-auto" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-3 py-3 border-b border-border/40 last:border-b-0"
          >
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3.5 w-16 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
