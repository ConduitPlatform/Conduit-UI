'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  deleteMessages,
  deleteRoomInvitations,
  getMessages,
  getRoomById,
  getRoomInvitations,
  removeUsersFromRoom,
} from '@/lib/api/chat';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { User } from '@/lib/models/User';
import { Profile } from '@/components/chat/rooms/profile';
import { Trash2Icon } from 'lucide-react';
import { ParticipantsLogs } from '@/lib/models/chat';
import moment from 'moment';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
      {currentRoom ? (
        <Tabs defaultValue="chat" className="w-full h-full space-y-5">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="invites">Invitations</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>
          <TabsContent value="chat">
            <div className="h-full overflow-auto space-y-3">
              {messages.messages.map(message => (
                <div className="flex flex-col gap-x-2">
                  <div className="flex gap-x-1 items-center">
                    <Profile
                      user={message.senderUser as User}
                      logs={currentRoom.participantsLog as ParticipantsLogs[]}
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button type="button">
                          <Trash2Icon className="opacity-0 group-hover:opacity-100 w-4 h-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Message</AlertDialogTitle>
                          <AlertDialogDescription>
                            <span>
                              Are you sure you want to delete this message?
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => deleteMessages([message._id])}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="invites" className="overflow-auto h-full">
            {invites.invitations.map(invite => (
              <>
                <div className="flex justify-between">
                  <div className="flex gap-x-1 items-center">
                    <Profile
                      user={invite.receiver as User}
                      logs={currentRoom.participantsLog as ParticipantsLogs[]}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {moment(invite.createdAt).format('DD MMM YYYY')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Send by {(invite.sender as User).email}
                      </span>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button type="button">
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
                        <AlertDialogDescription>
                          <span>
                            Are you sure you want to delete this invitation?
                          </span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () =>
                            deleteRoomInvitations(currentRoom._id, {
                              invitations: [invite._id],
                            })
                          }
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <span>{invite.token}</span>
              </>
            ))}
          </TabsContent>
          <TabsContent value="participants" className="overflow-auto space-y-3">
            {currentRoom.participants.length ? (
              (currentRoom.participants as User[]).map(p => (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-3">
                    <Profile
                      user={p}
                      logs={currentRoom.participantsLog as ParticipantsLogs[]}
                    />
                    <span className="text-sm"> {p.email}</span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button type="button">
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Message</AlertDialogTitle>
                        <AlertDialogDescription>
                          <span>
                            Are you sure you want to remove this user from the
                            room?
                          </span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () =>
                            removeUsersFromRoom(currentRoom._id, {
                              users: [p._id],
                            })
                          }
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            ) : (
              <span>Chat room has no participants</span>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <>Skeleton</>
      )}
    </div>
  );
};
