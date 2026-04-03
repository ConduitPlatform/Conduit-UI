'use client';
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
import { getUsers } from '@/lib/api/authentication';
import { DataTable } from '@/components/authentication/components/data-table';
import EmptyUsers from '@/components/authentication/users/emptyUsers';

export default function UsersTable({
  data,
  count: initialCount,
}: Readonly<{
  data: User[];
  count: number;
}>) {
  const searchParams = useSearchParams();

  const [count, setCount] = useState<number>(initialCount);
  const [users, setUsers] = useState<User[]>(data);
  const [search, setSearch] = useState<string>(
    searchParams.get('search') ?? ''
  );
  const { openUserAdd } = useUserActions();
  useEffect(() => {
    setUsers(data);
    setCount(initialCount);
  }, [data, initialCount]);
  const debouncedSearchTerm = useDebounce(search, 300);
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', search);
    if (debouncedSearchTerm === '') {
      params.delete('search');
    }
    window.history.pushState(null, '', `?${params.toString()}`);
    const skip = parseInt(searchParams.get('skip') ?? '0');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    getUsers(
      skip,
      limit,
      debouncedSearchTerm ? { search: debouncedSearchTerm } : {}
    ).then(data => {
      setCount(data.count);
      setUsers(data.users);
    });
  }, [debouncedSearchTerm]);

  return (
    <>
      <div className={'flex flex-row justify-between pb-2'}>
        <Input
          placeholder={'Search'}
          className={'w-44'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <AddUserSheet
          onSuccess={(user: User) => {
            setUsers([...users, user]);
          }}
        >
          <Button variant="outline">Add User</Button>
        </AddUserSheet>
      </div>
      <DataTable columns={columns} data={users} count={count}>
        <EmptyUsers userAdd={openUserAdd} />
      </DataTable>
    </>
  );
}
