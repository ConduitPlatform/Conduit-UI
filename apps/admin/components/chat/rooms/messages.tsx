'use client';

import { Profile } from '@/components/chat/helpers/profile';
import { User } from '@/lib/models/User';
import { ParticipantsLogs } from '@/lib/models/chat';
import moment from 'moment';
import { deleteMessages, getMessages, getRoomById } from '@/lib/api/chat';
import React, { useEffect, useState } from 'react';
import { DeleteAlert } from '@/components/chat/helpers/delete';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Decimal from 'decimal.js';
import { HashIcon } from 'lucide-react';
import { SearchInput } from '@/components/chat/helpers/search';

type MessagesResponse = Awaited<ReturnType<typeof getMessages>>;
type RoomResponse = Awaited<ReturnType<typeof getRoomById>>;

export const Messages = ({
  messages,
  room,
}: {
  messages: MessagesResponse;
  room: RoomResponse;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pageIndex, setPageIndex] = useState<number>(
    Number(searchParams.get('pageIndex')) ?? 0
  );
  const [count, _] = useState<number>(
    new Decimal(messages.count).div(9).ceil().toNumber()
  );

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('pageIndex', pageIndex.toString());
    router.push(`${pathname}?${params.toString()}`);
  }, [pageIndex]);

  return (
    <div className="flex flex-col w-2/3 h-[800px]">
      <div className="relative h-full w-full overflow-auto flex flex-col justify-between">
        <div className="sticky top-0 left-0 right-0 z-10 py-3 bg-background flex items-center justify-between">
          <div className="flex items-center gap-x-5">
            <div className="p-2.5 bg-slate-700 rounded-md">
              <HashIcon className="w-4 h-4" />
            </div>
            <span className="font-semibold text-xl">{room.name}</span>
          </div>
          <SearchInput />
        </div>
        <div className="flex flex-col space-y-3">
          {messages.messages.map(message => (
            <div className="flex flex-col gap-x-2">
              <div className="flex gap-x-1 items-center">
                <Profile
                  user={message.senderUser as User}
                  logs={room.participantsLog as ParticipantsLogs[]}
                />
                <span className="text-xs text-muted-foreground">
                  {moment(message.createdAt).format('DD MMM YYYY')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {moment(message.createdAt).isBefore(message.updatedAt) &&
                    'Edited'}
                </span>
              </div>
              <div className="group flex items-center gap-x-3">
                <span>{message.message}</span>
                {!room.deleted && (
                  <DeleteAlert
                    title={'Delete Message'}
                    description={'Are you sure you want to delete message?'}
                    callback={() =>
                      deleteMessages([message._id]).then(() => router.refresh())
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setPageIndex(prev => ++prev);
          }}
          disabled={!count || pageIndex === count - 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPageIndex(prev => --prev)}
          disabled={pageIndex === 0}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
