'use client';
import { z } from 'zod';
import { LucideX, PlusIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { NotificationToken } from '@/lib/models/notification/NotificationToken';
import { Button } from '@/components/ui/button';
import { useUserPicker } from '@/components/helpers/UserPicker/UserPicker';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import { InputField } from '@/components/ui/form-inputs/InputField';
import { TextAreaField } from '@/components/ui/form-inputs/TextAreaField';
import { CodeField } from '@/components/ui/form-inputs/CodeField';
import { sendNotifications } from '@/lib/api/notifications';
import { toast } from '@/lib/hooks/use-toast';

interface Props {
  token?: NotificationToken;
}

const FormSchema = z.object({
  users: z.array(z.object({ _id: z.string(), email: z.string() })).min(1),
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  body: z.string().optional(),
  data: z.string().optional(),
  silent: z.boolean().optional(),
  doNotStore: z.boolean().optional(),
});

export const TestSendForm = ({ token }: Props) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const { openPicker } = useUserPicker();
  const { reset, handleSubmit, setValue, watch } = form;

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    let jsonData;
    if (data.data) {
      try {
        jsonData = JSON.parse(data.data);
      } catch (e) {
        toast({
          title: 'Push Notifications',
          description: 'Data must be a valid JSON object',
        });
        return;
      }
    }

    await sendNotifications({
      userIds: data.users.map(user => user._id),
      title: data.title,
      body: data.body,
      data: jsonData,
      isSilent: data.silent,
      doNotStore: data.doNotStore,
    })
      .then(() => {
        toast({
          title: 'Push Notifications',
          description: 'Notifications sent',
        });
      })
      .catch(e => {
        toast({
          title: 'Push Notifications',
          description: 'Notifications failed to send',
        });
      });
    reset();
  };

  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <div className={'flex flex-col gap-6'}>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className={'space-y-4'}>
            <Button
              variant={'default'}
              type={'button'}
              onClick={() => {
                openPicker(
                  users => {
                    setValue('users', users);
                  },
                  {
                    title: 'Add Recipient(s)',
                    description:
                      'Select the recipient(s) to send the notification to',
                    multiple: true,
                  }
                );
              }}
            >
              <PlusIcon className={'w-6 h-6'} />
              Add recipient(s)
            </Button>
            <div className={'flex flex-row gap-2 '}>
              {form.watch('users')?.map((user, index) => (
                <div
                  key={user._id}
                  className={
                    'group flex flex-row items-center rounded-full bg-secondary w-fit px-2'
                  }
                >
                  <p>{user.email}</p>
                  <Button
                    variant={'ghost'}
                    className={'w-fit p-0 hidden group-hover:block'}
                    onClick={() => {
                      const users = watch('users');
                      setValue(
                        'users',
                        users.filter((_, i) => i !== index)
                      );
                    }}
                  >
                    <LucideX className={'w-4 h-4'} />
                  </Button>
                </div>
              ))}
            </div>
            <InputField label={'Notification Title'} fieldName={'title'} />
            <TextAreaField
              label={'Notification Body (optional)'}
              fieldName={'body'}
            />
            <CodeField
              label={'Data'}
              fieldName={'data'}
              placeholder={'{"key": "value"}'}
            />
            <SwitchField label={'Silent'} fieldName={'silent'} />
            <SwitchField label={'Do not store'} fieldName={'doNotStore'} />
            <div className={'flex flex-row justify-end gap-2'}>
              <Button variant={'secondary'} onClick={() => reset()}>
                Reset
              </Button>
              <Button type={'submit'}>Send Notification</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
