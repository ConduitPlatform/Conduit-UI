import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { addUsersToRoom } from '@/lib/api/chat';
import { useToast } from '@/lib/hooks/use-toast';
import { useUserPicker } from '@/components/helpers/UserPicker/UserPicker';
import { useCallback, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { ParticipantsTable } from '@/components/chat/rooms/tables/participants/data-table';
import { User } from '@/lib/models/User';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<User, any>[] = [
  {
    accessorKey: '_id',
    header: '_id',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
];

export const AddParticipantForm = ({
  roomId,
  callback,
}: {
  roomId: string;
  callback: () => void;
}) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const { openPicker } = useUserPicker();
  const formSchema = z.object({
    participants: z.array(z.string()),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      participants: [],
    },
  });

  const pickUsers = useCallback(() => {
    openPicker(pickedUsers => {
      setUsers(pickedUsers);
      form.setValue(
        'participants',
        pickedUsers.map(user => user._id),
        { shouldValidate: true }
      );
    });
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
        className="flex flex-col mt-5 space-y-5"
      >
        <ParticipantsTable columns={columns} users={users} />
        <button
          onClick={pickUsers}
          type="button"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          <span>Pick Users</span>
        </button>
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
};
