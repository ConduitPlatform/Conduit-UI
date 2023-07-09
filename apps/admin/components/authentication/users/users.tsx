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

export default function UsersTable({ data, count }: { data: User[], count: number }) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>('');
  const debouncedSearchTerm = useDebounce(search,  300);
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
    <div className='container mx-auto py-10'>
      <div className={'flex flex-row justify-between pb-2'}>
        <Input placeholder={'Search'} className={'w-44'} onChange={(e) => setSearch(e.target.value)} />
        <AddUserSheet onSuccess={(user:User)=>{
          debugger;
          setUsers([...users, user]);
        }}>
          <Button variant='outline'>Add User</Button>
        </AddUserSheet>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
