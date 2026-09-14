'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { BackfillActions } from '@/components/embeddings/backfills/backfill-actions';
import { BackfillStateBadge } from '@/components/embeddings/backfills/backfill-state-badge';
import { BackfillRun } from '@/lib/models/embeddings/backfill';
import {
  backfillProgress,
  formatBackfillTimestamp,
} from '@/lib/models/embeddings/backfill-view';

export const BACKFILL_COLUMNS: ColumnDef<BackfillRun>[] = [
  {
    id: 'schema',
    header: 'Schema',
    cell: ({ row }) => (
      <Link
        href={`/embeddings/backfills/${row.original._id}`}
        className="block min-w-0 font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="block truncate">{row.original.schemaName}</span>
      </Link>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-2">
        <BackfillActions run={row.original} compact />
      </div>
    ),
  },
  {
    id: 'state',
    header: 'State',
    cell: ({ row }) => <BackfillStateBadge state={row.original.state} />,
  },
  {
    id: 'progress',
    header: 'Queued progress',
    cell: ({ row }) => {
      const progress = backfillProgress(row.original);
      return (
        <div className="min-w-40 space-y-1">
          <p className="tabular-nums text-sm">
            {progress.queued > 0
              ? `${progress.done.toLocaleString()} / ${progress.queued.toLocaleString()}`
              : progress.scanning
                ? 'Scanning'
                : '—'}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {progress.scanned.toLocaleString()} scanned
            {progress.failed > 0
              ? ` · ${progress.failed.toLocaleString()} failed`
              : ''}
          </p>
        </div>
      );
    },
  },
  {
    id: 'config',
    header: 'Config',
    cell: ({ row }) =>
      row.original.configId ? (
        <Link
          href={`/embeddings/configs/${row.original.configId}`}
          className="truncate text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {row.original.configId}
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">All enabled</span>
      ),
  },
  {
    id: 'updated',
    header: 'Updated',
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">
        {formatBackfillTimestamp(
          row.original.updatedAt ?? row.original.createdAt
        )}
      </span>
    ),
  },
];
