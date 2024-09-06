'use client';

import {
  deleteRoomInvitations,
  getRoomById,
  getRoomInvitations,
} from '@/lib/api/chat';
import React from 'react';
import { User } from '@/lib/models/User';
import { Profile } from '@/components/chat/helpers/profile';
import { ParticipantsLogs } from '@/lib/models/chat';
import { DeleteAlert } from '@/components/chat/helpers/delete';
import { usePathname, useRouter } from 'next/navigation';
import moment from 'moment/moment';

type RoomResponse = Awaited<ReturnType<typeof getRoomById>>;
type InvitationResponse = Awaited<ReturnType<typeof getRoomInvitations>>;
export const Invitations = ({
  room,
  invites,
}: {
  room: RoomResponse;
  invites: InvitationResponse;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-y-3 w-full">
      <div className="flex justify-between">
        <div className="text-lg flex items-center gap-x-2">
          <span className="text-lg">Invitations</span>
          <div className="flex items-center justify-center w-6 h-6 rounded-full p-2 bg-slate-700 text-sm text-white">
            {invites.count}
          </div>
        </div>
        {/*<SlidersHorizontal className="w-4 h-4" />*/}
      </div>
      <div className="h-56 overflow-auto flex flex-col gap-y-3">
        {invites.invitations.map(invite => (
          <>
            <div className="flex justify-between">
              <div className="flex gap-x-1 items-center">
                <Profile
                  user={invite.receiver as User}
                  logs={room.participantsLog as ParticipantsLogs[]}
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
              {!room.deleted && (
                <DeleteAlert
                  title={'Delete Invitation'}
                  description={
                    'Are you sure you want to delete this invitation?'
                  }
                  callback={() =>
                    deleteRoomInvitations(room._id, {
                      invitations: [invite._id],
                    }).then(() => {
                      getRoomById(room._id, {})
                        .then(() => router.refresh())
                        .catch(() => router.push(`${pathname}`));
                    })
                  }
                />
              )}
            </div>
            <span>{invite.token}</span>
          </>
        ))}
      </div>
    </div>
  );
};
