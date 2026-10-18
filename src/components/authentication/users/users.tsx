'use client';
import { getUserColumns } from '@/components/authentication/users/columns';
import { User } from '@/lib/models/User';
import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AddUserSheet } from '@/components/authentication/users/addUserSheet/addUserSheet';
// @ts-ignore
import { useDebounce } from '@uidotdev/usehooks';
import { useUserActions } from '@/components/authentication/users/UserActionsProvider';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getUsers } from '@/lib/api/authentication';
import { DataTable } from '@/components/ui/data-table';
import EmptyUsers from '@/components/authentication/users/emptyUsers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  HOME_REALM_ALL,
  HOME_REALM_GLOBAL,
  homeRealmFilterToParam,
  homeRealmParamToFilter,
  withHomeRealmFilter,
} from '@/lib/authentication/realmMembers';

const NO_REALMS: ReadonlyMap<string, string> = new Map();

export default function UsersTable({
  data,
  count: initialCount,
  realmsEnabled = false,
  realmSlugs = NO_REALMS,
}: Readonly<{
  data: User[];
  count: number;
  /** Shows the Home realm column, filter and select. */
  realmsEnabled?: boolean;
  /** `teamId -> slug` of every realm. */
  realmSlugs?: ReadonlyMap<string, string>;
}>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const homeRealmFilter = realmsEnabled
    ? homeRealmParamToFilter(searchParams.get('homeRealm'))
    : HOME_REALM_ALL;
  const homeRealmParam = homeRealmFilterToParam(homeRealmFilter);
  const columns = useMemo(
    () => getUserColumns({ showHomeRealm: realmsEnabled, realmSlugs }),
    [realmsEnabled, realmSlugs]
  );
  const onHomeRealmFilterChange = (value: string) => {
    const params = withHomeRealmFilter(searchParams, value);
    router.replace(`${pathname}?${params.toString()}`);
  };

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
    getUsers(skip, limit, {
      ...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
      ...(homeRealmParam ? { homeRealm: homeRealmParam } : {}),
    }).then(data => {
      setCount(data.count);
      setUsers(data.users);
    });
  }, [debouncedSearchTerm]);

  return (
    <>
      <div className={'flex flex-row justify-between pb-2'}>
        <div className={'flex flex-row items-center gap-3'}>
          <Input
            placeholder={'Search'}
            className={'w-44'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {realmsEnabled && (
            <Select
              value={homeRealmFilter}
              onValueChange={onHomeRealmFilterChange}
            >
              <SelectTrigger className={'w-44'} aria-label="Home realm filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={HOME_REALM_ALL}>All home realms</SelectItem>
                <SelectItem value={HOME_REALM_GLOBAL}>Global</SelectItem>
                {Array.from(realmSlugs, ([id, slug]) => (
                  <SelectItem key={id} value={id}>
                    {slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <AddUserSheet
          realmsEnabled={realmsEnabled}
          realmSlugs={realmSlugs}
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
