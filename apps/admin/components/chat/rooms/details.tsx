'use client';

import { deleteRooms, getRoomById } from '@/lib/api/chat';
import { Calendar, Loader, User2Icon } from 'lucide-react';
import { User } from '@/lib/models/User';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';
import React from 'react';
import { DeleteAlert } from '@/components/chat/helpers/delete';
import { usePathname, useRouter } from 'next/navigation';

type RoomResponse = Awaited<ReturnType<typeof getRoomById>>;
export const Details = ({ room }: { room: RoomResponse }) => {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-y-3 w-full">
      <div className="text-lg flex items-center justify-between gap-x-2">
        <span className="text-lg">Main Info</span>
        <DeleteAlert
          title={'Delete Room'}
          description={'Are you sure you want to delete room?'}
          callback={() =>
            deleteRooms([room._id]).then(() =>
              getRoomById(room._id, {})
                .then(() => router.refresh())
                .catch(() => router.push(`${pathname}`))
            )
          }
          compressed={false}
          buttonText={'Delete Room'}
        />
      </div>
      <div className="flex flex-col divide-y">
        <div className="gap-x-40 flex justify-between py-2">
          <div className="flex items-center gap-1">
            <User2Icon className="w-4 h-4" />
            <span className="">Creator</span>
          </div>
          <div>{(room.creator as User)._id}</div>
        </div>
        <div className="gap-x-40 flex justify-between py-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span className="">Date of Creation</span>
          </div>
          <div>{moment(room.createdAt).format('DD MMM YYYY')}</div>
        </div>
        <div className="gap-x-40 flex justify-between py-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span className="">Last Updated</span>
          </div>
          <div>{moment(room.updatedAt).format('DD MMM YYYY')}</div>
        </div>
        <div className="gap-x-40 flex justify-between py-2">
          <div className="flex items-center gap-1">
            <Loader className="w-4 h-4" />
            <span className="">Status</span>
          </div>
          <div>
            <Badge variant={room.deleted ? 'destructive' : 'default'}>
              {room.deleted ? 'Deleted' : 'Active'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
