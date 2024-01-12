'use client';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAlerts } from '@/components/providers/AlertProvider';
import { CheckIcon, LoaderIcon, LucideX } from 'lucide-react';
import { toast } from '@/lib/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Form } from '@/components/ui/form';
import { SettingsForm } from '@/components/chat/settingsForm';
import { ChatSettings } from '@/lib/models/Chat';
import { patchChatSettings } from '@/lib/api/chat';

interface Props {
  data: ChatSettings;
  emailAvailable: boolean;
  pushNotificationsAvailable: boolean;
}

const FormSchema = z.object({
  allowMessageDelete: z.boolean(),
  allowMessageEdit: z.boolean(),
  deleteEmptyRooms: z.boolean(),
  auditMode: z.boolean(),
  explicit_room_joins: z.object({
    enabled: z.boolean(),
    send_email: z.boolean(),
    send_notification: z.boolean(),
  }),
});

export const Settings = ({ data, emailAvailable, pushNotificationsAvailable }: Props) => {
  const [chatModule, setChatModule] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const { addAlert } = useAlerts();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: data,
  });
  const { setValue, reset, control, handleSubmit, watch } = form;

  useEffect(() => {
    if (data) {
      setChatModule(data.active);
    }
  }, [data]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setEdit(false);
    const { id, dismiss } = toast({
      title: 'Chat',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <LoaderIcon className={'w-8 h-8 animate-spin'} />
          <p className='text-sm text-foreground'>Updating Chat Settings...</p>
        </div>
      ),
    });

    patchChatSettings(data).then(res => {
      dismiss();
      const chatModule = res.find(module => module.moduleName === 'chat');
      if (chatModule && chatModule.serving)
        toast({
          title: 'Chat',
          description: (
            <div className={'flex flex-row items-center space-x-2.5'}>
              <CheckIcon className={'w-8 h-8'} />
              <p className='text-sm text-foreground'>Chat Settings Updated!</p>
            </div>
          ),
        });
      else
        toast({
          title: 'Chat',
          description: (
            <div className={'flex flex-col'}>
              <div className={'flex flex-row text-destructive items-center'}>
                <LucideX className={'w-8 h-8'} />
                <p className='text-sm'>Failed to update with:</p>
              </div>
              <pre className='mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive'>
                <code
                  className='text-sm text-foreground'>Activation was not successful. Check the logs for more info</code>
              </pre>
            </div>
          ),
        });
    }).catch((error) => {
      dismiss();
      toast({
        title: 'Chat',
        description: (
          <div className={'flex flex-col'}>
            <div className={'flex flex-row text-destructive items-center'}>
              <LucideX className={'w-8 h-8'} />
              <p className='text-sm'>Failed to update with:</p>
            </div>
            <pre className='mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive'>
              <code className='text-sm text-foreground'>{error.message}</code>
            </pre>
          </div>
        ),
      });
    });
  };

  const handleSwitchChange = () => {
    addAlert({
      title: 'Chat Module',
      description: `Are you sure you want to ${chatModule ? 'disable' : 'enable'} Chat module?`,
      cancelText: 'Cancel',
      actionText: 'Proceed',
      onDecision: (cancel) => {
        if (!cancel) {
          const { id, dismiss } = toast({
            title: 'Chat',
            description: (
              <div className={'flex flex-row items-center space-x-2.5'}>
                <LoaderIcon className={'w-8 h-8 animate-spin'} />
                <p className='text-sm text-foreground'>Updating Chat Settings...</p>
              </div>
            ),
          });
          const updatedSettings = {
            active: !chatModule,
          };
          setChatModule(!chatModule);
          patchChatSettings(updatedSettings).then(
            res => {
              dismiss();
              toast({
                title: 'Chat',
                description: (
                  <div className={'flex flex-row items-center space-x-2.5'}>
                    <CheckIcon className={'w-8 h-8'} />
                    <p className='text-sm text-foreground'>Chat Settings Updated!</p>
                  </div>
                ),
              });
            },
          ).catch(err => {
            dismiss();
            setChatModule(data.active);
            toast({
              title: 'Chat',
              description: (
                <div className={'flex flex-col'}>
                  <div className={'flex flex-row text-destructive items-center'}>
                    <LucideX className={'w-8 h-8'} />
                    <p className='text-sm'>Failed to update with:</p>
                  </div>
                  <pre className='mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive'>
                      <code className='text-sm text-foreground'>{err.message}</code>
                    </pre>
                </div>
              ),
            });
          });
        }
      },
    });
  };


  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <div className={'flex flex-col gap-6'}>
        <div className='space-y-0.5'>
          <div className={'flex gap-2 items-center'}>
            <p className='text-2xl font-medium'>
              Chat Module
            </p>
            <Switch
              checked={chatModule}
              onCheckedChange={() => {
                handleSwitchChange();
              }}
            />
          </div>
          <div className={'pr-2'}>
            <p className={'text-xs text-[#94A3B8]'}>
              To get an idea on how to setup Chat take a look at our documentation.
            </p>
          </div>
        </div>
        {chatModule &&
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <SettingsForm
                control={control}
                edit={edit}
                setEdit={setEdit}
                watch={watch}
                reset={reset}
                data={data}
                emailAvailable={emailAvailable}
                pushNotificationsAvailable={pushNotificationsAvailable}
              />
            </form>
          </Form>
        }
      </div>
    </div>
  );
};
