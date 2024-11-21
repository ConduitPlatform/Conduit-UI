'use client';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
// @ts-ignore
import { useDebounce } from '@uidotdev/usehooks';
import { useSearchParams } from 'next/navigation';
import { NotificationToken } from '@/lib/models/notification/NotificationToken';
import { DataTable } from '@/components/notifications/tokens/data-table';
import { columns } from '@/components/notifications/tokens/columns';

export default function NotificationTokensTable({
  data,
  count,
  refreshData,
}: {
  data: NotificationToken[];
  count: number;
  refreshData: (searchString: string) => Promise<NotificationToken[]>;
}) {
  const searchParams = useSearchParams();

  const [tokens, setTokens] = useState<NotificationToken[]>(data);
  const [search, setSearch] = useState<string>(
    searchParams.get('search') ?? ''
  );
  const debouncedSearchTerm = useDebounce(search, 300);
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', search);
    if (debouncedSearchTerm === '') {
      params.delete('search');
    }
    window.history.pushState(null, '', `?${params.toString()}`);
    if (debouncedSearchTerm === '') {
      setTokens(data);
      return;
    }
    refreshData(debouncedSearchTerm).then(tokens => setTokens(tokens));
  }, [debouncedSearchTerm]);

  return (
    <div className="container py-10">
      <div className={'flex flex-row justify-between pb-2'}>
        <Input
          placeholder={'Search'}
          className={'w-44'}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <DataTable columns={columns} data={tokens} />
    </div>
  );
}
