import { getTokens } from '@/lib/api/notifications';
import NotificationTokensTable from '@/components/notifications/tokens/tokens';

export default async function TokensPage({
  searchParams,
}: {
  searchParams: {
    skip: number;
    limit: number;
    sort?: string;
    search?: string;
    platform?: string;
  };
}) {
  const data = await getTokens(
    searchParams.skip ?? 0,
    searchParams.limit ?? 20,
    { ...searchParams }
  );
  const refreshTokens = async (search: string) => {
    'use server';
    const { tokens } = await getTokens(
      searchParams.skip ?? 0,
      searchParams.limit ?? 20,
      { ...searchParams }
    );
    return tokens;
  };

  return (
    <NotificationTokensTable
      data={data.tokens}
      count={data.count}
      refreshData={refreshTokens}
    />
  );
}
