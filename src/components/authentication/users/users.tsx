'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type {
  OnChangeFn,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table';
// @ts-ignore
import { useDebounce } from '@uidotdev/usehooks';
import { getUserColumns } from '@/components/authentication/users/columns';
import { AddUserSheet } from '@/components/authentication/users/addUserSheet/addUserSheet';
import { BulkActionsBar } from '@/components/authentication/users/BulkActionsBar';
import { UserFilters } from '@/components/authentication/users/UserFilters';
import { useUserActions } from '@/components/authentication/users/UserActionsProvider';
import { useBulkUserActions } from '@/components/authentication/users/useBulkUserActions';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import EmptyUsers from '@/components/authentication/users/emptyUsers';
import {
  LEGACY_CAPABILITIES,
  type UserAdminCapabilities,
} from '@/lib/authentication/userCapabilities';
import {
  applyUserListPatch,
  nextSort,
  parseUserListParams,
  providerChoices,
  type UserListPatch,
  type UserSortField,
} from '@/lib/authentication/userListParams';
import { MAX_REALMS_IN_FILTERS } from '@/lib/authentication/realmMembers';
import type { RealmIdentityMode } from '@/lib/models/authentication/teams.config';
import { User } from '@/lib/models/User';

const NO_REALMS: ReadonlyMap<string, string> = new Map();

export default function UsersTable({
  data,
  count,
  realmsEnabled = false,
  realmSlugs = NO_REALMS,
  realmsTruncated = false,
  identityMode = 'shared',
  capabilities = LEGACY_CAPABILITIES,
  providers,
}: Readonly<{
  data: User[];
  count: number;
  /** Shows the Home realm column, filter and select. */
  realmsEnabled?: boolean;
  /** `teamId -> slug` of every realm. */
  realmSlugs?: ReadonlyMap<string, string>;
  /** There are more realms than `realmSlugs` holds; the filter lists only the first ones. */
  realmsTruncated?: boolean;
  /** Isolated mode: the same email can appear once per realm, which the table says. */
  identityMode?: RealmIdentityMode;
  capabilities?: UserAdminCapabilities;
  /** Enabled sign-in strategies. Defaults to the schema list. */
  providers?: readonly string[];
}>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const providerOptions = providers ?? providerChoices(undefined, capabilities);
  const query = useMemo(
    () => parseUserListParams(searchParams, capabilities),
    [capabilities, searchParams]
  );
  const urlSearch = searchParams.get('search') ?? '';
  const [searchDraft, setSearchDraft] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchDraft, 300);
  const writtenSearch = useRef(urlSearch);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const listKey = data
    .map(user => `${user._id}:${String(user.updatedAt)}:${user.isVerified}`)
    .join('|');
  const [pendingKey, setPendingKey] = useState(listKey);
  const [pendingById, setPendingById] = useState<
    ReadonlyMap<string, Partial<User>>
  >(() => new Map());
  if (pendingKey !== listKey) {
    setPendingKey(listKey);
    setPendingById(new Map());
  }

  const onVerified = (userId: string, isVerified: boolean) => {
    setPendingById(current => {
      const next = new Map(current);
      next.set(userId, { isVerified });
      return next;
    });
  };

  const rows = useMemo(
    () =>
      data.map(item => {
        const pending = pendingById.get(item._id);
        return pending ? { ...item, ...pending } : item;
      }),
    [data, pendingById]
  );
  const onPatch = (patch: UserListPatch) => {
    const params = applyUserListPatch(searchParams, patch, capabilities);
    router.replace(`${pathname}?${params.toString()}`);
  };
  const onSort = (field: UserSortField) => {
    onPatch({ sort: nextSort(query.sort, field) ?? null });
  };
  const columns = getUserColumns({
    showHomeRealm: realmsEnabled,
    realmSlugs,
    onVerified,
    sort: query.sort,
    onSort,
  });
  const sorting = useMemo<SortingState>(() => {
    if (!query.sort) return [];
    const desc = query.sort.startsWith('-');
    const id = desc ? query.sort.slice(1) : query.sort;
    return [{ id, desc }];
  }, [query.sort]);

  const onSettled = (failedIds: string[]) => {
    setRowSelection(Object.fromEntries(failedIds.map(id => [id, true])));
  };
  const {
    status: bulkStatus,
    block,
    unblock,
    remove,
  } = useBulkUserActions(onSettled);
  const { openUserAdd, setBulkRunning } = useUserActions();
  const selectedUsers = useMemo(
    () => rows.filter(user => rowSelection[user._id]),
    [rowSelection, rows]
  );
  const running = bulkStatus.kind === 'running';

  useEffect(() => {
    if (writtenSearch.current === urlSearch) return;
    writtenSearch.current = urlSearch;
    setSearchDraft(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (debouncedSearch === urlSearch) return;
    writtenSearch.current = debouncedSearch;
    const params = applyUserListPatch(
      searchParams,
      { search: debouncedSearch || null },
      capabilities
    );
    router.replace(`${pathname}?${params.toString()}`);
  }, [
    capabilities,
    debouncedSearch,
    pathname,
    router,
    searchParams,
    urlSearch,
  ]);

  // Deleting the last rows of the last page leaves `skip` past the end.
  useEffect(() => {
    if (data.length > 0 || count <= 0 || query.skip <= 0) return;
    const lastPageSkip = Math.floor((count - 1) / query.limit) * query.limit;
    if (lastPageSkip >= query.skip) return;
    const params = applyUserListPatch(
      searchParams,
      { skip: lastPageSkip },
      capabilities
    );
    router.replace(`${pathname}?${params.toString()}`);
  }, [
    capabilities,
    count,
    data.length,
    pathname,
    query.limit,
    query.skip,
    router,
    searchParams,
  ]);

  useEffect(() => {
    setBulkRunning(running);
    return () => setBulkRunning(false);
  }, [running, setBulkRunning]);

  const onRowSelectionChange: OnChangeFn<RowSelectionState> = updater => {
    if (running) return;
    setRowSelection(current =>
      typeof updater === 'function' ? updater(current) : updater
    );
  };

  return (
    <>
      <div className="flex flex-row flex-wrap items-start justify-between gap-2 pb-2">
        <UserFilters
          search={searchDraft}
          onSearchChange={setSearchDraft}
          query={query}
          capabilities={capabilities}
          providers={providerOptions}
          realmsEnabled={realmsEnabled}
          realmSlugs={realmSlugs}
          onPatch={onPatch}
        />
        <AddUserSheet
          realmsEnabled={realmsEnabled}
          realmSlugs={realmSlugs}
          identityMode={identityMode}
          onSuccess={() => router.refresh()}
        >
          <Button variant="outline">Add User</Button>
        </AddUserSheet>
      </div>
      {realmsEnabled && realmsTruncated && (
        <p className="pb-2 text-xs text-muted-foreground">
          Showing the first {MAX_REALMS_IN_FILTERS} realms in filters
        </p>
      )}
      {identityMode === 'isolated' && (
        <p className="pb-2 text-xs text-pretty text-muted-foreground">
          Isolated identity mode: the same email can appear once per realm
        </p>
      )}
      {(selectedUsers.length > 0 || running) && (
        <div className="pb-2">
          <BulkActionsBar
            count={selectedUsers.length}
            blockCount={selectedUsers.filter(user => user.active).length}
            unblockCount={selectedUsers.filter(user => !user.active).length}
            status={bulkStatus}
            onBlock={() => block(selectedUsers)}
            onUnblock={() => unblock(selectedUsers)}
            onDelete={() => remove(selectedUsers)}
            onClear={() => setRowSelection({})}
          />
        </div>
      )}
      <DataTable
        columns={columns}
        data={rows}
        count={count}
        sorting={sorting}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        getRowId={row => row._id}
      >
        <EmptyUsers userAdd={openUserAdd} />
      </DataTable>
    </>
  );
}
