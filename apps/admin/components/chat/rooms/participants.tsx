'use client';

import { getRoomById, removeUsersFromRoom } from '@/lib/api/chat';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import React, { useState } from 'react';
import { AddParticipantForm } from '@/components/chat/rooms/forms/addParticipant';
import { PlusIcon } from 'lucide-react';
import { User } from '@/lib/models/User';
import { Profile } from '@/components/chat/helpers/profile';
import { ParticipantsLogs } from '@/lib/models/chat';
import { DeleteAlert } from '@/components/chat/helpers/delete';
import { usePathname, useRouter } from 'next/navigation';

type RoomResponse = Awaited<ReturnType<typeof getRoomById>>;
export const Participants = ({ room }: { room: RoomResponse }) => {
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-y-3 w-full">
      <div className="flex justify-between">
        <div className="text-lg flex items-center gap-x-2">
          <span className="text-lg">Members</span>
          <div className="flex items-center justify-center w-6 h-6 rounded-full p-2 bg-slate-700 text-sm text-white">
            {room.participants.length}
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button>
                <PlusIcon className="w-4 h-4" />
              </button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl">
              <SheetTitle>Add Member</SheetTitle>
              <AddParticipantForm
                roomId={room._id}
                callback={() => {
                  setOpen(!open);
                  router.refresh();
                }}
              />
            </SheetContent>
          </Sheet>
          {/*<SlidersHorizontal className="w-4 h-4" />*/}
        </div>
      </div>
      <div className="h-56 overflow-auto flex flex-col gap-y-3">
        {!!room.participants.length &&
          (room.participants as User[]).map(p => (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-3">
                <Profile
                  user={p}
                  logs={room.participantsLog as ParticipantsLogs[]}
                />
                <div className="flex flex-col">
                  <span className="text-sm">{p.email}</span>
                  <span className="text-sm text-muted-foreground">{p._id}</span>
                </div>
              </div>
              <DeleteAlert
                title={'Remove Members'}
                description={'Are you sure you want to remove user from room'}
                callback={() =>
                  removeUsersFromRoom(room._id, {
                    users: [p._id],
                  }).then(() => {
                    getRoomById(room._id, {})
                      .then(() => router.refresh())
                      .catch(() => router.push(`${pathname}`));
                  })
                }
              />
            </div>
          ))}
      </div>
    </div>
  );
};
