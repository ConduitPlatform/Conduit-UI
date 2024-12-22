'use client';

import { useSearchParams } from 'next/navigation';
import { FunctionExecutionModel, FunctionModel } from '@/lib/models/functions';
import { DataTable } from '@/components/functions/tables/data-table';
import { useColumns } from '@/components/functions/tables/executions/columns';

export default function FunctionExecutionTable({
  data,
  functionData,
  count,
}: {
  data: FunctionExecutionModel[];
  functionData: FunctionModel;
  count: number;
}) {
  const searchParams = useSearchParams();

  return (
    <div className="space-y-5">
      <div>
        <h1 className={'text-2xl font-bold'}>{functionData.name}</h1>
        <span className="text-muted-foreground text-sm">
          {functionData.functionType}-{functionData._id}
        </span>
      </div>

      <DataTable columns={useColumns()} data={data} />
    </div>
  );
}
