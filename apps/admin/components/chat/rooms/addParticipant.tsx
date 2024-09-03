import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { addUsersToRoom } from '@/lib/api/chat';
import { useToast } from '@/lib/hooks/use-toast';
import { PotentialParticipants } from '@/components/chat/rooms/participantsTable';
import { useEffect, useState } from 'react';
import { getUsers } from '@/lib/api/authentication';
import { User } from '@/lib/models/User';
import { columns } from '@/components/chat/rooms/columns/add-to-room';

export const AddParticipantForm = ({
  roomId,
  callback,
}: {
  roomId: string;
  callback: () => void;
}) => {
  const { toast } = useToast();
  const formSchema = z.object({
    participants: z.array(z.string()),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      participants: [],
    },
  });

  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    getUsers(0, 100, {
      sort: '-name',
    }).then(res => setUsers(res.users));
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(data =>
          addUsersToRoom(roomId, { users: data.participants })
            .then(() => {
              toast({
                title: 'CHAT',
                description: 'New User Added',
              });
              callback();
            })
            .catch(err =>
              toast({
                title: 'CHAT',
                description: err.message,
              })
            )
        )}
      >
        <PotentialParticipants users={users} columns={columns()} />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
};
