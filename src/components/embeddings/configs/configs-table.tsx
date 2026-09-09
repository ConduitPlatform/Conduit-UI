'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getConfigColumns } from '@/components/embeddings/configs/columns';
import {
  configIndexStateLabel,
  EmbeddingConfigListRow,
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

type ConfigsTableProps = {
  rows: EmbeddingConfigListRow[];
};

function ConfigsEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 py-6">
      <p className="text-sm font-medium">No embedding configs</p>
      <p className="max-w-md text-sm text-muted-foreground text-pretty">
        Create a config to provision a matching vector index. Keep it disabled
        until that index is queryable, then run a backfill.
      </p>
      <Button asChild className="mt-2">
        <Link href="/embeddings/configs/new">
          <Plus className="size-4" />
          New config
        </Link>
      </Button>
    </div>
  );
}

function ConfigListCard({ row }: { row: EmbeddingConfigListRow }) {
  const run = row.latestBackfill;
  return (
    <Card className="min-w-0">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/embeddings/configs/${row.config._id}`}
            className="min-w-0 break-all font-medium text-primary underline-offset-4 hover:underline"
          >
            {row.config.schemaName}
          </Link>
          <Badge
            variant={row.config.enabled ? 'default' : 'secondary'}
            className="shrink-0"
          >
            {row.config.enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        <dl className="grid gap-3 text-sm">
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Target</dt>
            <dd className="break-all font-medium">{row.config.targetField}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Provider</dt>
            <dd className="break-all">
              {row.config.provider}/{row.config.model}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Index</dt>
            <dd
              className={cn('font-medium', INDEX_STATE_CLASS[row.indexState])}
            >
              {configIndexStateLabel(row.indexState)}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Latest backfill</dt>
            <dd>
              {run ? (
                <Link
                  href={`/embeddings/backfills/${run._id}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {run.state.charAt(0).toUpperCase() + run.state.slice(1)}
                </Link>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

export function ConfigsTable({ rows }: ConfigsTableProps) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {rows.length === 0 ? (
          <ConfigsEmpty />
        ) : (
          rows.map(row => <ConfigListCard key={row.config._id} row={row} />)
        )}
      </div>
      <div className="hidden md:block">
        <DataTable columns={getConfigColumns()} data={rows}>
          <ConfigsEmpty />
        </DataTable>
      </div>
    </>
  );
}
