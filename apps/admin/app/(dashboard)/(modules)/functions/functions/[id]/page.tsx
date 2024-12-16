import { getFunction, getFunctionExecutions } from '@/lib/api/functions';
import FunctionExecutionTable from '@/components/functions/tables/executions/executions';

export default async function FunctionsList({
  params,
  searchParams,
}: {
  params: {
    id: string;
  };
  searchParams?: {
    success?: string;
  };
}) {
  const functionData = await getFunction(params.id);
  const data = await getFunctionExecutions(functionData.name, {
    success: searchParams?.success
      ? searchParams.success === 'true'
      : undefined,
  });
  return (
    <FunctionExecutionTable
      data={data.functionExecutions}
      functionData={functionData}
      count={data.count}
    />
  );
}
