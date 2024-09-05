'use client';

import { columns } from '@/components/chat/rooms/tables/rooms/columns';
import {
  ChatRoomsResponse,
  RoomsDataTable,
} from '@/components/chat/rooms/tables/rooms/data-table';
//@ts-ignore
import { useDebounce } from '@uidotdev/usehooks';
import React, { useEffect, useState } from 'react';
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

export const RoomsDashboard = ({ data }: { data: ChatRoomsResponse }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState<boolean>(false);
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
    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    setSearch(searchParams.get('search') ?? '');
  }, [searchParams.get('search')]);

  return (
    <>
      <div className="w-full flex justify-between">
        <Input
          placeholder={'Search By Name'}
          className={'w-44'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button>Create Room</Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[600px]">
            <SheetTitle>Create Room</SheetTitle>
            <CreateRoomForm callback={() => setOpen(!open)} />
          </SheetContent>
        </Sheet>
      </div>
      <RoomsDataTable data={data} columns={columns} />
    </>
  );
};
