'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { configIndexStateLabel } from '@/lib/models/embeddings/index-state';
import { cn } from '@/lib/utils';
import {
  SETTINGS_CTA_LABEL,
  SETTINGS_HREF,
} from '@/lib/models/embeddings/config-catalogue';
import {
  catalogRowIndex,
  catalogRowProfile,
  catalogRowStatus,
  catalogRowTarget,
  catalogRowTypeLabel,
  type EmbeddingCatalogRow,
} from '@/lib/models/embeddings/catalog';
import { sourceIndexState } from '@/lib/models/embeddings/source';

const INDEX_STATE_CLASS: Record<string, string> = {
  ready: 'text-status-healthy',
  pending: 'text-status-warning',
  failed: 'text-status-critical',
  missing: 'text-status-critical',
  unknown: 'text-status-unknown',
};

function indexLabel(row: EmbeddingCatalogRow): string {
  if (row.type === 'schema') {
    return configIndexStateLabel(row.schema.indexState);
  }
  const state = sourceIndexState(row.source);
  switch (state) {
    case 'ready':
      return 'Ready';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    case 'unknown':
      return 'Unknown';
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

export const CONFIG_COLUMNS: ColumnDef<EmbeddingCatalogRow>[] = [
  {
    id: 'type',
    header: 'Type',
    cell: ({ row }) => catalogRowTypeLabel(row.original),
  },
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="min-w-0">
        <Link
          href={row.original.href}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          <span className="block truncate">{row.original.title}</span>
        </Link>
      </div>
    ),
  },
  {
    id: 'target',
    header: 'Target',
    cell: ({ row }) => (
      <div className="truncate">{catalogRowTarget(row.original)}</div>
    ),
  },
  {
    id: 'provider',
    header: 'Provider / model',
    cell: ({ row }) => {
      const blocked =
        row.original.type === 'schema' && row.original.schema.modelBlocked;
      return (
        <div className="min-w-0">
          <div className="truncate">{catalogRowProfile(row.original)}</div>
          {blocked ? (
            <Link
              href={SETTINGS_HREF}
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              {SETTINGS_CTA_LABEL}
            </Link>
          ) : null}
        </div>
      );
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const enabled =
        row.original.type === 'schema'
          ? row.original.schema.config.enabled
          : row.original.source.state === 'ready';
      return (
        <Badge variant={enabled ? 'default' : 'secondary'}>
          {catalogRowStatus(row.original)}
        </Badge>
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
          INDEX_STATE_CLASS[catalogRowIndex(row.original)]
        )}
      >
        {indexLabel(row.original)}
      </span>
    ),
  },
];
