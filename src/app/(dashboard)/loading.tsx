import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      {/* Status bar placeholder */}
      <div className="flex items-center justify-between h-9 px-5 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton className="size-[7px] rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Command palette hint placeholder */}
      <div className="px-5 pt-2.5 pb-0 shrink-0">
        <Skeleton className="h-8 w-full rounded-md" />
      </div>

      {/* Content area */}
      <div className="px-5 pt-4 pb-8 space-y-4">
        {/* Module grid */}
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-16" />
          <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[52px] rounded-lg" />
            ))}
          </div>
        </div>

        {/* Bottom split: metrics 2fr + chart 3fr */}
        <div className="grid gap-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Skeleton className="h-[320px] rounded-lg" />
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-[320px] rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
