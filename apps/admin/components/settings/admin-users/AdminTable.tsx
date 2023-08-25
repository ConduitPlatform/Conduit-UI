'use client';
import { DataTable } from '@/components/authentication/users/data-table';
import { columns } from '@/components/settings/admin-users/columns';
import { User } from '@/lib/models/User';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// @ts-ignore
import { useDebounce } from '@uidotdev/usehooks';
import { useAdminActions } from '@/components/settings/admin-users/AdminsProvider';
import { AddAdminSheet } from '@/components/settings/admin-users/AddAdminSheet';

export default function AdminTable({ data, count }: { data: User[], count: number }) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>('');
  const { openUserAdd } = useAdminActions();
  const debouncedSearchTerm = useDebounce(search, 300);
  useEffect(() => {
    setUsers(data);
  }, [data]);
  useEffect(() => {
    //TODO: get results based on search
  }, [debouncedSearchTerm]);

  return (
    <div className='container mx-auto py-10'>
      <div className={'flex flex-row justify-between pb-2'}>
        <Input placeholder={'Search'} className={'w-44'} onChange={(e) => setSearch(e.target.value)} />
        <AddAdminSheet onSuccess={(user: User) => {
          setUsers([...users, user]);
        }}>
          <Button variant='outline'>Create</Button>
        </AddAdminSheet>
      </div>
      <DataTable columns={columns} data={users} userAdd={openUserAdd}/>
    </div>
  );
}