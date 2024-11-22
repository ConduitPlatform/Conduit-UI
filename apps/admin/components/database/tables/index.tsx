'use client';

import { DataTable } from '@/components/database/tables/data-table';
import { useColumns } from '@/components/database/tables/columns';

type ModelDataTableProps = {
  documents: {
    documents: any[];
    count: number;
  };
  model: string;
};

export default function ModelDataTable({
  documents,
  model,
}: ModelDataTableProps) {
  return (
    <div className="flex flex-col h-full col-span-full overflow-scroll">
      <div>filter</div>
      <DataTable
        docs={documents.documents}
        count={documents.count}
        columns={useColumns(documents.documents, model)}
      />
    </div>
  );
}
