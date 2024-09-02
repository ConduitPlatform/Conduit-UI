import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreateRoomForm } from '@/components/chat/rooms/createForm';

type LobbyProps = {
  children?: React.ReactNode;
};
export const Lobby: React.FC<LobbyProps> = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="flex flex-col space-y-5">
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Create Room</Button>
        </DialogTrigger>
        <DialogContent className={'max-w-fit'}>
          <DialogHeader>
            <DialogTitle>Create Room</DialogTitle>
          </DialogHeader>
          <CreateRoomForm callback={() => setOpen(!open)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
