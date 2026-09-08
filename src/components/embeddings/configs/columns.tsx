'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  configIndexStateLabel,
  EmbeddingConfigListRow,
  similarityLabel,
} from '@/lib/models/embeddings/index-state';
import { cn } from '@/lib/utils';

const INDEX_STATE_CLASS: Record<EmbeddingConfigListRow['indexState'], string> =
  {
    ready: 'text-status-healthy',
    pending: 'text-status-warning',
    failed: 'text-status-critical',
    missing: 'text-status-critical',
    unknown: 'text-status-unknown',
  };

export function getConfigColumns(): ColumnDef<EmbeddingConfigListRow>[] {
  return [
    {
      id: 'schema',
      header: 'Schema',
      cell: ({ row }) => (
        <div className="min-w-0">
          <Link
            href={`/embeddings/configs/${row.original.config._id}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            <span className="block truncate">
              {row.original.config.schemaName}
            </span>
          </Link>
        </div>
      ),
    },
    {
      id: 'target',
      header: 'Target',
      cell: ({ row }) => (
        <div className="truncate">{row.original.config.targetField}</div>
      ),
    },
    {
      id: 'provider',
      header: 'Provider / model',
      cell: ({ row }) => (
        <div className="truncate">
          {row.original.config.provider}/{row.original.config.model}
        </div>
      ),
    },
    {
      id: 'dimensions',
      header: 'Dimensions',
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.config.dimensions}</span>
      ),
    },
    {
      id: 'similarity',
      header: 'Similarity',
      cell: ({ row }) => similarityLabel(row.original.config.similarity),
    },
    {
      id: 'enabled',
      header: 'Enabled',
      cell: ({ row }) => (
        <Badge variant={row.original.config.enabled ? 'default' : 'secondary'}>
          {row.original.config.enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      ),
    },
    {
      id: 'backfill',
      header: 'Latest backfill',
      cell: ({ row }) => {
        const run = row.original.latestBackfill;
        if (!run) return <span className="text-muted-foreground">—</span>;
        return (
          <Link
            href={`/embeddings/backfills/${run._id}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {run.state.charAt(0).toUpperCase() + run.state.slice(1)}
          </Link>
        );
      },
    },
    {
      id: 'index',
      header: 'Index',
      cell: ({ row }) => (
        <span
          className={cn(
            'text-sm font-medium',
            INDEX_STATE_CLASS[row.original.indexState]
          )}
        >
          {configIndexStateLabel(row.original.indexState)}
        </span>
      ),
    },
  ];
}
