import { getFunction } from '@/lib/api/functions';
import { redirect } from 'next/navigation';
import { getMiddlewares } from '@/lib/api/router';
import { EditFunctionForm } from '@/components/functions/EditFunctionForm';

export default async function FunctionsEdit({
  searchParams,
}: {
  searchParams?: {
    function: string;
  };
}) {
  if (!searchParams?.function) {
    return redirect('/functions/functions');
  }
  const middlewares = await getMiddlewares();
  const functionData = await getFunction(searchParams?.function);
  return (
    <EditFunctionForm middlewares={middlewares} functionData={functionData} />
  );
}
