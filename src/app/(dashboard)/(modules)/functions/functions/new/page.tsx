import { CreateFunctionForm } from '@/components/functions/CreateFunctionForm';
import { getMiddlewares } from '@/lib/api/router';
import { PageHeader, PageTitle } from '@/components/ui/page-header';

export type GetMiddlewaresResponseType = Awaited<
  ReturnType<typeof getMiddlewares>
>;
export default async function NewFunctionPage() {
  const middlewares = await getMiddlewares();
  return (
    <div className="flex flex-col space-y-4">
      <PageHeader>
        <PageTitle>Create Serverless Function</PageTitle>
      </PageHeader>
      <CreateFunctionForm middlewares={middlewares} />
    </div>
  );
}
