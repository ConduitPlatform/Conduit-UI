'use client';

import Link from 'next/link';
import { BackfillFilters } from '@/components/embeddings/backfills/backfill-filters';
import { getBackfillColumns } from '@/components/embeddings/backfills/columns';
import { useBackfillPolling } from '@/components/embeddings/backfills/use-backfill-polling';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { BackfillRun } from '@/lib/models/embeddings/backfill';
import { EmbeddingConfig } from '@/lib/models/embeddings/config';
import {
  BackfillListUrlState,
  hasActiveBackfillRuns,
} from '@/lib/models/embeddings/backfill-view';

type BackfillsTableProps = {
  runs: BackfillRun[];
  count: number;
  query: BackfillListUrlState;
  configs: EmbeddingConfig[];
  schemas: string[];
  hasConfigs: boolean;
};

export function BackfillsTable({
  runs,
  count,
  query,
  configs,
  schemas,
  hasConfigs,
}: BackfillsTableProps) {
  useBackfillPolling(hasActiveBackfillRuns(runs));

  return (
    <div className="space-y-4">
      <BackfillFilters query={query} schemas={schemas} configs={configs} />
      <DataTable columns={getBackfillColumns()} data={runs} count={count}>
        <div className="flex flex-col items-center gap-2 py-6">
          <p className="text-sm font-medium">No backfill runs</p>
          <p className="max-w-md text-sm text-muted-foreground text-pretty">
            {hasConfigs
              ? 'Start a run from a ready config. Progress is of queued documents, not the full collection.'
              : 'Create a config first, then start a backfill from this page.'}
          </p>
          {!hasConfigs ? (
            <Button asChild className="mt-2">
              <Link href="/embeddings/configs">Open configs</Link>
            </Button>
          ) : null}
        </div>
      </DataTable>
    </div>
  );
}
