import { getFunctions } from '@/lib/api/functions';
import FunctionsTable from '@/components/functions/tables/functions/functions';

export default async function FunctionsList(props: {
  searchParams: Promise<{
    skip: number;
    limit: number;
    sort?: string;
    search?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const data = await getFunctions({
    skip: searchParams.skip ?? 0,
    limit: searchParams.limit ?? 20,
    search: searchParams.search,
    sort: searchParams.sort,
  });
  const refreshFunctions = async (search: string) => {
    'use server';
    const { functions } = await getFunctions({
      skip: searchParams.skip ?? 0,
      limit: searchParams.limit ?? 20,
      search: search,
      sort: searchParams.sort,
    });
    return functions;
  };
  return (
    <FunctionsTable
      data={data.functions}
      count={data.count}
      refreshData={refreshFunctions}
    />
  );
}
