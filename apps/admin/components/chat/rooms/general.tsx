'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMessages, getRoomById, getRoomInvitations } from '@/lib/api/chat';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { User } from '@/lib/models/User';
import { Profile } from '@/components/chat/rooms/profile';
import { Trash2Icon } from 'lucide-react';
import { ParticipantsLogs } from '@/lib/models/chat';

type Messages = Awaited<ReturnType<typeof getMessages>>;
type ChatRoom = Awaited<ReturnType<typeof getRoomById>>;
type Invites = Awaited<ReturnType<typeof getRoomInvitations>>;

export const ChatRoomPage = ({
  messages,
  invites,
}: {
  messages: Messages;
  invites: Invites;
}) => {
  const searchParams = useSearchParams();

  const [currentRoom, setCurrentRoom] = useState<ChatRoom | undefined>(
    undefined
  );

  useEffect(() => {
    const roomId = searchParams.get('room');
    if (roomId)
      getRoomById(roomId, {
        populate: ['participants', 'participantsLog', 'participantsLog.user'],
      }).then(res => setCurrentRoom(res));
  }, [searchParams]);

  return (
    <div className="flex gap-x-4 h-svh">
      <Tabs defaultValue="chat" className="w-full h-full space-y-5">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="invites">Invitations</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
        </TabsList>
        <TabsContent value="chat">
          {messages.messages.map(message => (
            <span>{message.message}</span>
          ))}
        </TabsContent>
        <TabsContent value="invites" className="overflow-auto h-full">
          {invites.invitations.map(invite => (
            <span>{invite.token}</span>
          ))}
        </TabsContent>
        <TabsContent value="participants" className="overflow-auto space-y-3">
          {currentRoom && currentRoom.participants.length ? (
            (currentRoom.participants as User[]).map(p => (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-3">
                  <Profile
                    user={p}
                    logs={currentRoom.participantsLog as ParticipantsLogs[]}
                  />
                  <span className="text-sm"> {p.email}</span>
                </div>
                <button onClick={() => console.log('delete')}>
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <span>Chat room has no participants</span>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
