import { getFunction, getFunctionExecutions } from '@/lib/api/functions';
import FunctionExecutionTable from '@/components/functions/tables/executions/executions';

export default async function FunctionsList(props: {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    success?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const functionData = await getFunction(params.id);
  const data = await getFunctionExecutions(functionData._id, {
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
