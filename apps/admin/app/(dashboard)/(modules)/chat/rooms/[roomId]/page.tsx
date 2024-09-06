import { getMessages, getRoomById, getRoomInvitations } from '@/lib/api/chat';
import { getModules } from '@/lib/api/modules';
import { HashIcon } from 'lucide-react';
import React from 'react';
import { Messages } from '@/components/chat/rooms/messages';
import { Details } from '@/components/chat/rooms/details';
import { Participants } from '@/components/chat/rooms/participants';
import { Invitations } from '@/components/chat/rooms/invitations';
import { SearchInput } from '@/components/chat/helpers/search';

type ChatRoomParams = {
  searchParams?: {
    skip?: number;
    limit?: number;
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
    skip: 0,
    limit: 20,
    sort: searchParams?.sort,
    roomId: params.roomId,
    populate: ['readBy', 'senderUser'],
    search: searchParams?.search,
  });
  const invites = await getRoomInvitations(params.roomId, {
    populate: ['sender', 'receiver'],
  });

  return (
    <div className="w-full h-[800px] flex gap-x-10 divide-x">
      <div className="relative w-2/3 overflow-hidden">
        <div className="sticky top-0 left-0 right-0 py-3 flex items-center justify-between">
          <div className="flex items-center gap-x-5">
            <div className="p-2.5 bg-slate-700 rounded-md">
              <HashIcon className="w-4 h-4" />
            </div>
            <span className="font-semibold text-xl">{currentRoom.name}</span>
          </div>
          <SearchInput />
        </div>
        <div className="overflow-auto space-y-3 h-[800px]">
          <Messages messages={messages} room={currentRoom} />
        </div>
      </div>
      <div className="px-7 space-y-5">
        <Details room={currentRoom} />
        <Participants room={currentRoom} />
        <Invitations room={currentRoom} invites={invites} />
      </div>
    </div>
  );
}
