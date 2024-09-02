'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getRooms } from '@/lib/api/chat';
import { Lobby } from '@/components/chat/rooms/lobby';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Rooms = Awaited<ReturnType<typeof getRooms>>;
export const ROOMS_LIMIT = 10;

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<Rooms>({
    chatRoomDocuments: [],
    count: 0,
  });

  useEffect(() => {
    const skip = Number(searchParams.get('skip')) ?? 0;
    const sort = searchParams.get('sort') ?? '-createdAt';
    getRooms({ skip, limit: ROOMS_LIMIT, sort }).then(res => setRooms(res));
  }, [searchParams.get('skip')]);

  const roomsNavigation = useMemo(() => {
    return (
      <div className="flex flex-col space-y-5 h-full">
        <h1 className="font-semibold text-3xl">Rooms</h1>
        <div className="flex flex-col">
          {rooms.chatRoomDocuments.map(room => (
            <button
              className={cn(
                `inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium`,
                room._id === searchParams.get('room')
                  ? 'bg-secondary text-secondary-foreground shadow-sm'
                  : 'bg-transparent'
              )}
              key={room._id}
              onClick={() => {
                const params = new URLSearchParams();
                params.set('room', room._id);
                router.push(`${pathname}?${params.toString()}`);
              }}
            >
              {room.name}
            </button>
          ))}
        </div>
        <Button>Create Room</Button>
      </div>
    );
  }, [searchParams, rooms]);

  return (
    <div className="flex gap-x-10">
      <Lobby>{roomsNavigation}</Lobby>
      {searchParams.get('room') && children}
    </div>
  );
}
