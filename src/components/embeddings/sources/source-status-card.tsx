'use client';

import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  sourceStateLabel,
  type EmbeddingSourceStatus,
} from '@/lib/models/embeddings/source';

const COUNT_ROWS: {
  key: keyof Pick<
    EmbeddingSourceStatus,
    | 'queuedCount'
    | 'extractingCount'
    | 'indexedCount'
    | 'skippedCount'
    | 'failedCount'
    | 'staleCount'
    | 'deletedCount'
  >;
  label: string;
}[] = [
  { key: 'queuedCount', label: 'Queued' },
  { key: 'extractingCount', label: 'Extracting' },
  { key: 'indexedCount', label: 'Indexed' },
  { key: 'skippedCount', label: 'Skipped' },
  { key: 'failedCount', label: 'Failed' },
  { key: 'staleCount', label: 'Stale' },
  { key: 'deletedCount', label: 'Deleted' },
];

type SourceStatusCardProps = {
  status?: EmbeddingSourceStatus;
  error?: string;
};

export function SourceStatusCard({ status, error }: SourceStatusCardProps) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Status unavailable</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading status…</p>
        </CardContent>
      </Card>
    );
  }

  const queue = status.extractionQueue;
  const failedQueue = (queue?.failed ?? 0) + (queue?.delayed ?? 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">
          {sourceStateLabel(status.source.state)}
          {status.ready ? '' : ' · not searchable'}
        </p>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COUNT_ROWS.map(row => (
            <div key={row.key} className="min-w-0">
              <dt className="text-xs text-muted-foreground">{row.label}</dt>
              <dd className="font-medium tabular-nums">{status[row.key]}</dd>
            </div>
          ))}
        </dl>
        {queue ? (
          <p className="text-sm text-muted-foreground">
            Extraction queue: {queue.active} active, {queue.waiting} waiting
            {failedQueue > 0 ? `, ${failedQueue} failed or retrying` : ''}.
          </p>
        ) : null}
        {status.warnings.length > 0 ? (
          <Alert variant="warning">
            <Info className="size-4" />
            <AlertTitle>Warnings</AlertTitle>
            <AlertDescription>{status.warnings.join(' ')}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
