import { getMessages, getRoomInvitations } from '@/lib/api/chat';
import { getModules } from '@/lib/api/modules';
import { ChatRoomPage } from '@/components/chat/rooms/general';

type ChatRoomParams = {
  searchParams?: {
    skip?: number;
    limit?: number;
    sort?: string;
    room?: string;
  };
};

export default async function ChatRooms({ searchParams }: ChatRoomParams) {
  const modules = await getModules();
  const chatAvailable = !!modules.find(
    m => m.moduleName === 'chat' && m.serving
  );
  if (!chatAvailable) return <>Chat module is not serving.</>;

  let messages: Awaited<ReturnType<typeof getMessages>> = {
    messages: [],
    count: 0,
  };
  let invites: Awaited<ReturnType<typeof getRoomInvitations>> = {
    invitations: [],
    count: 0,
  };
  if (searchParams?.room) {
    messages = await getMessages({
      skip: 0,
      limit: 20,
      roomId: searchParams?.room,
      populate: ['readBy', 'senderUser'],
    });
    invites = await getRoomInvitations(searchParams.room, {
      populate: ['sender', 'receiver'],
    });
  }

  return <ChatRoomPage messages={messages} invites={invites} />;
}
