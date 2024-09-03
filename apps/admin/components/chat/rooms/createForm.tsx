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
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@/lib/models/User';
import { PotentialParticipants } from '@/components/chat/rooms/participantsTable';
import { useEffect, useState } from 'react';
import { getUsers } from '@/lib/api/authentication';
import { isEmpty } from 'lodash';
import { columns } from '@/components/chat/rooms/columns/create-room';

export const CreateRoomForm = ({ callback }: { callback: () => void }) => {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const formSchema = z.object({
    name: z.string(),
    participants: z.array(z.string()),
    creator: z.string(),
  });
  const [users, setUsers] = useState<User[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      name: '',
      participants: [],
      creator: '',
    },
  });

  useEffect(() => {
    getUsers(0, 100, {
      sort: '-name',
    }).then(res => setUsers(res.users));
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
              const params = new URLSearchParams();
              params.set('room', res._id);
              router.push(`${pathname}?${params.toString()}`);
            })
            .catch(err =>
              toast({
                title: 'CHAT',
                description: err.message,
              })
            )
        )}
        className="space-y-5 w-96"
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
        <PotentialParticipants
          users={users}
          columns={columns({ formRef: form })}
        />
        <DialogFooter>
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
        </DialogFooter>
      </form>
    </Form>
  );
};
