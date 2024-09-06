'use client';

import { columns } from '@/components/chat/rooms/tables/rooms/columns';
import {
  ChatRoomsResponse,
  RoomsDataTable,
} from '@/components/chat/rooms/tables/rooms/data-table';
//@ts-ignore
import { useDebounce } from '@uidotdev/usehooks';
import React, { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CreateRoomForm } from '@/components/chat/rooms/forms/createForm';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { XIcon } from 'lucide-react';
import { useUserPicker } from '@/components/helpers/UserPicker/UserPicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const RoomsDashboard = ({ data }: { data: ChatRoomsResponse }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { openPicker } = useUserPicker();
  const [users, setUsers] = useState<string[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [deleted, setDeleted] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string>('');

  const pickUsers = useCallback(() => {
    openPicker(pickedUsers => {
      const params = new URLSearchParams();
      params.set('users', `${pickedUsers.map(user => user._id).join(',')}`);
      router.push(`${pathname}?${params.toString()}`);
    });
  }, []);

  const resetPickedUsers = useCallback(() => {
    const params = new URLSearchParams();
    params.delete('users');
    router.push(`${pathname}?${params.toString()}`);
  }, []);

  const debouncedSearchTerm = useDebounce(search, 300);
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', search);
    if (debouncedSearchTerm === '') {
      params.delete('search');
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    setSearch(searchParams.get('search') ?? '');
  }, [searchParams.get('search')]);

  useEffect(() => {
    setUsers(searchParams.get('users')?.split(',') ?? []);
  }, [searchParams.get('users')]);

  useEffect(() => {
    setDeleted(searchParams.get('deleted') ?? undefined);
  }, [searchParams.get('deleted')]);

  return (
    <>
      <div className="w-full flex justify-between">
        <div className="flex gap-x-5 items-center">
          <Input
            placeholder={'Search By Name'}
            className={'w-44'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Select
            onValueChange={value => {
              const params = new URLSearchParams();
              params.set('deleted', value);
              router.push(`${pathname}?${params.toString()}`);
            }}
            value={deleted}
          >
            <SelectTrigger className="rounded-md px-3 py-2 text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm border-0 focus:ring-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Deleted</SelectItem>
              <SelectItem value="false">Active</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center">
            <button
              onClick={pickUsers}
              type="button"
              className="inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span className="text-muted-foreground">Users</span>
              {!!users.length ? (
                <div className="ml-2 flex items-center gap-x-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full p-2 bg-slate-700 text-sm text-white">
                    {users.length}
                  </div>
                  <span>Selected</span>
                </div>
              ) : (
                <>:All</>
              )}
            </button>
            {!!users.length && (
              <button
                onClick={resetPickedUsers}
                className="disabled:text-muted-foreground"
              >
                <XIcon />
              </button>
            )}
          </div>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button>Create Room</Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-xl">
            <SheetTitle>Create Room</SheetTitle>
            <CreateRoomForm callback={() => setOpen(!open)} />
          </SheetContent>
        </Sheet>
      </div>
      <RoomsDataTable data={data} columns={columns()} />
    </>
  );
};
