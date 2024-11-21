'use client';

import { DataTable } from '@/components/database/tables/data-table';
import { columns } from '@/components/database/tables/columns';

type ModelDataTableProps = {
  documents: {
    documents: any[];
    count: number;
  };
};

export default function ModelDataTable({ documents }: ModelDataTableProps) {
  return (
    <div className="flex flex-col h-full col-span-full overflow-scroll">
      <div>filter</div>
      <DataTable
        docs={documents.documents}
        columns={columns(documents.documents)}
      />
    </div>
  );
}
