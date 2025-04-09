import { getMessages, getRoomById, getRoomInvitations } from '@/lib/api/chat';
import { getModules } from '@/lib/api/modules';
import React from 'react';
import { Messages } from '@/components/chat/rooms/messages';
import { Details } from '@/components/chat/rooms/details';
import { Participants } from '@/components/chat/rooms/participants';
import { Invitations } from '@/components/chat/rooms/invitations';

type ChatRoomParams = {
  searchParams?: {
    pageIndex?: number;
    sort?: string;
    search?: string;
  };
  params: {
    roomId: string;
  };
};

export default async function ChatRoomPage({
  searchParams,
  params,
}: ChatRoomParams) {
  const modules = await getModules();
  const chatModuleAvailable = !!modules.find(
    m => m.moduleName === 'chat' && m.serving
  );
  if (!chatModuleAvailable) return <>Chat module is not serving.</>;
  const currentRoom = await getRoomById(params.roomId, {
    populate: [
      'participants',
      'participantsLog',
      'participantsLog.user',
      'creator',
    ],
  });
  const messages = await getMessages({
    skip: searchParams?.pageIndex ? searchParams.pageIndex * 9 : 0,
    limit: 9,
    sort: '-createdAt',
    roomId: params.roomId,
    populate: ['readBy', 'senderUser'],
    search: searchParams?.search,
  }).then(res => ({ ...res, messages: res.messages.reverse() }));
  const invites = await getRoomInvitations(params.roomId, {
    skip: 0,
    limit: 100,
    populate: ['sender', 'receiver'],
  });

  return (
    <div className="w-full flex gap-x-10 divide-x">
      <Messages messages={messages} room={currentRoom} />
      <div className="px-7 space-y-5">
        <Details room={currentRoom} />
        <Participants room={currentRoom} />
        <Invitations room={currentRoom} invites={invites} />
      </div>
    </div>
  );
}
