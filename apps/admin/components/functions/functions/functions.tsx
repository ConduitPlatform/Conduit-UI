'use client';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
// @ts-ignore
import { useDebounce } from '@uidotdev/usehooks';
import { useSearchParams } from 'next/navigation';
import { FunctionModel } from '@/lib/models/functions';
import { DataTable } from '@/components/functions/functions/data-table';
import { useColumns } from '@/components/functions/functions/columns';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';

export default function FunctionsTable({
  data,
  count,
  refreshData,
}: {
  data: FunctionModel[];
  count: number;
  refreshData: (searchString: string) => Promise<FunctionModel[]>;
}) {
  const searchParams = useSearchParams();

  const [functions, setFunctions] = useState<FunctionModel[]>(data);
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
      setFunctions(data);
      return;
    }
    refreshData(debouncedSearchTerm).then(tokens => setFunctions(tokens));
  }, [debouncedSearchTerm]);

  return (
    <>
      <div className={'flex flex-row justify-between pb-2'}>
        <Input
          placeholder={'Search'}
          className={'w-44'}
          onChange={e => setSearch(e.target.value)}
        />

        <Link href={'/functions/functions/new'}>
          <Button variant={'outline'} className={'flex flex-row items-center'}>
            <PlusIcon className={'w-4 h-4'} />
            New Function
          </Button>
        </Link>
      </div>
      <DataTable columns={useColumns()} data={functions} />
    </>
  );
}
