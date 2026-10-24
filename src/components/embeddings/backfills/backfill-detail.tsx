'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { BackfillActions } from '@/components/embeddings/backfills/backfill-actions';
import { BackfillCounters } from '@/components/embeddings/backfills/backfill-counters';
import { BackfillStateBadge } from '@/components/embeddings/backfills/backfill-state-badge';
import { useBackfillPolling } from '@/components/embeddings/backfills/use-backfill-polling';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PageActions,
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';
import {
  BackfillRun,
  isActiveBackfillState,
} from '@/lib/models/embeddings/backfill';
import {
  backfillTimeline,
  formatBackfillTimestamp,
  sanitizeBackfillErrorDisplay,
} from '@/lib/models/embeddings/backfill-view';
import { cn } from '@/lib/utils';

type BackfillDetailProps = {
  run: BackfillRun;
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums text-pretty">{value}</dd>
    </div>
  );
}

export function BackfillDetail({ run }: BackfillDetailProps) {
  useBackfillPolling(isActiveBackfillState(run.state));
  const timeline = backfillTimeline(run);
  const error = sanitizeBackfillErrorDisplay(run.error);
  const filterJson =
    run.filter && Object.keys(run.filter).length > 0
      ? JSON.stringify(run.filter, null, 2)
      : undefined;

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader className="flex-col items-start gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <PageTitle className="text-balance">{run.schemaName}</PageTitle>
          <PageDescription>
            Backfill run {run._id}. Queued progress does not mean the collection
            is fully scanned.
          </PageDescription>
        </div>
        <PageActions className="flex-wrap">
          <BackfillActions run={run} />
        </PageActions>
      </PageHeader>
      <Card>
        <CardHeader className="gap-1">
          <CardTitle>State</CardTitle>
          <BackfillStateBadge state={run.state} />
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="grid gap-3 sm:grid-cols-4">
            {timeline.map(item => (
              <li key={item.id} className="min-h-8">
                <p
                  className={cn(
                    'text-xs font-medium',
                    item.status === 'current' && 'text-foreground',
                    item.status === 'done' && 'text-status-healthy',
                    item.status === 'pending' && 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </p>
                <p className="tabular-nums text-sm text-muted-foreground">
                  {formatBackfillTimestamp(item.at)}
                </p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Counters</CardTitle>
        </CardHeader>
        <CardContent>
          <BackfillCounters run={run} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Run details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Fact label="Cursor" value={run.cursor ?? '—'} />
            <Fact label="Batch size" value={run.batchSize.toLocaleString()} />
            <Fact label="Only missing" value={run.onlyMissing ? 'Yes' : 'No'} />
            <Fact
              label="Config"
              value={run.configId ?? 'All enabled configs'}
            />
            <Fact
              label="Created"
              value={formatBackfillTimestamp(run.createdAt)}
            />
            <Fact
              label="Updated"
              value={formatBackfillTimestamp(run.updatedAt)}
            />
            <Fact
              label="Started"
              value={formatBackfillTimestamp(run.startedAt)}
            />
            <Fact
              label="Finished"
              value={formatBackfillTimestamp(run.finishedAt)}
            />
          </dl>
          {run.configId ? (
            <p className="pt-3">
              <Link
                href={`/embeddings/configs/${run.configId}`}
                className="inline-flex min-h-8 items-center text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Open config
              </Link>
            </p>
          ) : null}
          {filterJson ? (
            <pre className="mt-4 overflow-x-auto rounded-md border border-border/60 bg-surface-1 p-3 font-mono text-xs text-pretty">
              {filterJson}
            </pre>
          ) : null}
        </CardContent>
      </Card>
      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Run error</AlertTitle>
          <AlertDescription className="text-pretty">{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
