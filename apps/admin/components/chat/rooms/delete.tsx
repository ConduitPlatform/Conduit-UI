'use client';

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
import { Trash2Icon } from 'lucide-react';
import { deleteRooms } from '@/lib/api/chat';
import React from 'react';
import { useRouter } from 'next/navigation';

export const DeleteRoomAlert = ({ roomIds }: { roomIds: string[] }) => {
  const router = useRouter();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button type="button">
          <Trash2Icon className="w-4 h-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Room</AlertDialogTitle>
          <AlertDialogDescription>
            <span>Are you sure you want to delete this room?</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () =>
              deleteRooms(roomIds).then(() => router.refresh())
            }
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
