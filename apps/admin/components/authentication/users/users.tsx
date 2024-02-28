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
import { getUsers } from '@/lib/api/authentication';
import { useUserActions } from '@/components/authentication/users/UserActionsProvider';

export default function UsersTable({ data, count }: { data: User[], count: number }) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>('');
  const { openUserAdd } = useUserActions();
  const debouncedSearchTerm = useDebounce(search, 300);
  useEffect(() => {
    setUsers(data);
  }, [data]);
  useEffect(() => {
    getUsers(0, 10, { search: debouncedSearchTerm })
      .then((res) => {
        setUsers(res.users);
      });
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
