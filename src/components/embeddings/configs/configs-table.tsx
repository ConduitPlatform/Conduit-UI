'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CONFIG_COLUMNS } from '@/components/embeddings/configs/columns';
import {
  catalogRowIndex,
  catalogRowProfile,
  catalogRowStatus,
  catalogRowTarget,
  catalogRowTypeLabel,
  type EmbeddingCatalogRow,
} from '@/lib/models/embeddings/catalog';
import { configIndexStateLabel } from '@/lib/models/embeddings/index-state';
import { cn } from '@/lib/utils';
import {
  SETTINGS_CTA_LABEL,
  SETTINGS_HREF,
} from '@/lib/models/embeddings/config-catalogue';
import { sourceIndexState } from '@/lib/models/embeddings/source';

const INDEX_STATE_CLASS: Record<string, string> = {
  ready: 'text-status-healthy',
  pending: 'text-status-warning',
  failed: 'text-status-critical',
  missing: 'text-status-critical',
  unknown: 'text-status-unknown',
};

type ConfigsTableProps = {
  rows: EmbeddingCatalogRow[];
};

function ConfigsEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 py-6">
      <p className="text-sm font-medium">No embedding sources</p>
      <p className="max-w-md text-sm text-muted-foreground text-pretty">
        Create a Database schema config, a Conduit Storage source, or an
        External source. Schema configs stay disabled until their index is
        queryable.
      </p>
      <Button asChild className="mt-2">
        <Link href="/embeddings/configs/new">
          <Plus className="size-4" />
          Database schema
        </Link>
      </Button>
    </div>
  );
}

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

function ConfigListCard({ row }: { row: EmbeddingCatalogRow }) {
  const blocked = row.type === 'schema' && row.schema.modelBlocked;
  const run = row.type === 'schema' ? row.schema.latestBackfill : undefined;
  const enabled =
    row.type === 'schema'
      ? row.schema.config.enabled
      : row.source.state === 'ready';
  return (
    <Card className="min-w-0">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={row.href}
            className="min-w-0 break-all font-medium text-primary underline-offset-4 hover:underline"
          >
            {row.title}
          </Link>
          <Badge variant="outline" className="shrink-0">
            {catalogRowTypeLabel(row)}
          </Badge>
          <Badge
            variant={enabled ? 'default' : 'secondary'}
            className="shrink-0"
          >
            {catalogRowStatus(row)}
          </Badge>
        </div>
        <dl className="grid gap-3 text-sm">
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Target</dt>
            <dd className="break-all font-medium">{catalogRowTarget(row)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Provider</dt>
            <dd className="break-all">
              {catalogRowProfile(row)}
              {blocked ? (
                <Link
                  href={SETTINGS_HREF}
                  className="mt-1 block min-h-8 font-medium text-primary underline-offset-4 hover:underline"
                >
                  {SETTINGS_CTA_LABEL}
                </Link>
              ) : null}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Index</dt>
            <dd
              className={cn(
                'font-medium',
                INDEX_STATE_CLASS[catalogRowIndex(row)]
              )}
            >
              {indexLabel(row)}
            </dd>
          </div>
          {run ? (
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Latest backfill</dt>
              <dd>
                <Link
                  href={`/embeddings/backfills/${run._id}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {run.state.charAt(0).toUpperCase() + run.state.slice(1)}
                </Link>
              </dd>
            </div>
          ) : null}
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
          rows.map(row => <ConfigListCard key={row.id} row={row} />)
        )}
      </div>
      <div className="hidden md:block">
        <Suspense
          fallback={
            <div className="h-64 rounded-md border border-border/60 bg-muted/20" />
          }
        >
          <DataTable columns={CONFIG_COLUMNS} data={rows}>
            <ConfigsEmpty />
          </DataTable>
        </Suspense>
      </div>
    </>
  );
}
