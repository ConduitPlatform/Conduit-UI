'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { getConfigColumns } from '@/components/embeddings/configs/columns';
import { EmbeddingConfigListRow } from '@/lib/models/embeddings/index-state';

type ConfigsTableProps = {
  rows: EmbeddingConfigListRow[];
};

export function ConfigsTable({ rows }: ConfigsTableProps) {
  return (
    <DataTable columns={getConfigColumns()} data={rows}>
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
    </DataTable>
  );
}
