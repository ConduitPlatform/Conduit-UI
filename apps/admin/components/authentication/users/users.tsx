'use client';
import { DataTable } from '@/components/authentication/users/data-table';
import { columns } from '@/components/authentication/users/columns';
import { User } from '@/lib/models/User';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AddUserSheet } from '@/components/authentication/users/addUserSheet/addUserSheet';
// @ts-ignore
import { useDebounce } from '@uidotdev/usehooks';
import { useUserActions } from '@/components/authentication/users/UserActionsProvider';
import { useSearchParams } from 'next/navigation';

export default function UsersTable({ data, count, refreshData }: {
  data: User[], count: number,
  refreshData: (searchString: string) => Promise<User[]>
}) {
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<User[]>(data);
  const [search, setSearch] = useState<string>(searchParams.get('search') ?? '');
  const { openUserAdd } = useUserActions();
  const debouncedSearchTerm = useDebounce(search, 300);
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', search);
    if (debouncedSearchTerm === '') {
      params.delete('search');
    }
    window.history.pushState(null, '', `?${params.toString()}`);
    if (debouncedSearchTerm === '') {
      setUsers(data);
      return;
    }
    refreshData(debouncedSearchTerm).then((users) => setUsers(users));
  }, [debouncedSearchTerm]);

  return (
    <>
      <div className={'flex flex-row justify-between pb-2'}>
        <Input placeholder={'Search'} className={'w-44'} onChange={(e) => setSearch(e.target.value)} />
        <AddUserSheet onSuccess={(user: User) => {
          setUsers([...users, user]);
        }}>
          <Button variant='outline'>Add User</Button>
        </AddUserSheet>
      </div>
      <DataTable columns={columns} data={users} userAdd={openUserAdd} />
    </>
  );
}
