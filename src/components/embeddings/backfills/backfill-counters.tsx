'use client';

import { BackfillRun } from '@/lib/models/embeddings/backfill';
import { backfillProgress } from '@/lib/models/embeddings/backfill-view';

type BackfillCountersProps = {
  run: BackfillRun;
};

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="tabular-nums text-sm font-medium">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

export function BackfillCounters({ run }: BackfillCountersProps) {
  const progress = backfillProgress(run);
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Count label="Scanned" value={progress.scanned} />
        <Count label="Queued" value={progress.queued} />
        <Count label="Processed" value={progress.processed} />
        <Count label="Failed" value={progress.failed} />
      </div>
      <div className="space-y-1">
        {progress.percent != null ? (
          <div
            className="h-1.5 overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percent}
            aria-label={progress.caption}
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground text-pretty tabular-nums">
          {progress.caption}
        </p>
      </div>
    </div>
  );
}
