import { CreateFunctionForm } from '@/components/functions/CreateFunctionForm';
import { getMiddlewares } from '@/lib/api/router';

export type GetMiddlewaresResponseType = Awaited<
  ReturnType<typeof getMiddlewares>
>;
export default async function NewFunctionPage() {
  const middlewares = await getMiddlewares();
  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-2xl font-semibold">Create Serverless Function</h1>
      <CreateFunctionForm middlewares={middlewares} />
    </div>
  );
}
