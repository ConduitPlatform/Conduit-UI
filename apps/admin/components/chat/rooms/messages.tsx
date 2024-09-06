'use client';

import { Profile } from '@/components/chat/helpers/profile';
import { User } from '@/lib/models/User';
import { ParticipantsLogs } from '@/lib/models/chat';
import moment from 'moment';
import { deleteMessages, getMessages, getRoomById } from '@/lib/api/chat';
import React from 'react';
import { DeleteAlert } from '@/components/chat/helpers/delete';
import { useRouter } from 'next/navigation';

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
  return messages.messages.map(message => (
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
          {moment(message.createdAt).isBefore(message.updatedAt) && 'Edited'}
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
  ));
};
