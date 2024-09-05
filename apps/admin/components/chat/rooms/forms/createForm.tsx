import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { createRoom } from '@/lib/api/chat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { isEmpty } from 'lodash';
import { useUserPicker } from '@/components/helpers/UserPicker/UserPicker';
import { PlusIcon } from 'lucide-react';
import { ParticipantsTable } from '@/components/chat/rooms/tables/participants/data-table';
import { columns } from '@/components/chat/rooms/tables/participants/columns';
import { User } from '@/lib/models/User';

export const CreateRoomForm = ({ callback }: { callback: () => void }) => {
  const { toast } = useToast();
  const { openPicker } = useUserPicker();
  const router = useRouter();
  const pathname = usePathname();
  const [users, setUsers] = useState<User[]>([]);
  const formSchema = z.object({
    name: z.string(),
    participants: z.array(z.string()),
    creator: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      name: '',
      participants: [],
      creator: '',
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
      form.setValue('creator', '', { shouldValidate: true });
    });
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(data =>
          createRoom(data)
            .then(res => {
              toast({
                title: 'CHAT',
                description: 'New Room Created',
              });
              callback();
              router.push(`${pathname}/${res._id}`);
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  title={'Name'}
                  placeholder={'Enter a value'}
                  className={'text-accent-foreground'}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <ParticipantsTable columns={columns({ formRef: form })} users={users} />
        <button
          onClick={pickUsers}
          type="button"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          Add Participants
        </button>
        <Button
          type="submit"
          disabled={
            isEmpty(form.getValues('creator')) ||
            form.getValues('participants').length === 0 ||
            isEmpty(form.getValues('name'))
          }
        >
          Save
        </Button>
      </form>
    </Form>
  );
};
