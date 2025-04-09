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
import { SmsSettings } from '@/lib/models/Sms';
import { isEmpty } from 'lodash';
import { patchSmsSettings } from '@/lib/api/sms';
import { SettingsForm } from '@/components/sms/settingsForm';

interface Props {
  data: SmsSettings;
}

const FormSchema = z
  .object({
    providerName: z.string(),
    twilio: z.object({
      phoneNumber: z.string(),
      accountSID: z.string(),
      authToken: z.string(),
      verify: z.object({
        active: z.boolean(),
        serviceSid: z.string(),
      }),
    }),
    awsSns: z.object({
      region: z.string(),
      accessKeyId: z.string(),
      secretAccessKey: z.string(),
    }),
    messageBird: z.object({
      accessKeyId: z.string(),
      originatorName: z.string(),
    }),
    clickSend: z.object({
      username: z.string(),
      clicksendApiKey: z.string(),
    }),
  })
  .refine(
    schema => {
      if (schema.providerName === 'twilio' && !isEmpty(schema.twilio))
        return false;
      if (schema.providerName === 'awsSns' && !isEmpty(schema.awsSns))
        return false;
      if (
        schema.providerName === 'messageBird' &&
        !isEmpty(schema.messageBird)
      ) {
        return false;
      }
      return !(
        schema.providerName === 'clickSend' && !isEmpty(schema.clickSend)
      );
    },
    {
      message: 'You need to fill in all the fields below for this provider',
      path: ['provider'],
    }
  );

export const Settings = ({ data }: Props) => {
  const [smsModule, setSmsModule] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const { addAlert } = useAlerts();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: data,
  });
  const { setValue, reset, control, handleSubmit, watch } = form;

  useEffect(() => {
    if (data) {
      setSmsModule(data.active);
    }
  }, [data]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setEdit(false);
    const { id, dismiss } = toast({
      title: 'SMS',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <LoaderIcon className={'w-8 h-8 animate-spin'} />
          <p className="text-sm text-foreground">Updating SMS Settings...</p>
        </div>
      ),
    });

    patchSmsSettings(data)
      .then(res => {
        dismiss();
        const smsModule = res.find(module => module.moduleName === 'sms');
        if (smsModule && smsModule.serving)
          toast({
            title: 'SMS',
            description: (
              <div className={'flex flex-row items-center space-x-2.5'}>
                <CheckIcon className={'w-8 h-8'} />
                <p className="text-sm text-foreground">SMS Settings Updated!</p>
              </div>
            ),
          });
        else
          toast({
            title: 'SMS',
            description: (
              <div className={'flex flex-col'}>
                <div className={'flex flex-row text-destructive items-center'}>
                  <LucideX className={'w-8 h-8'} />
                  <p className="text-sm">Failed to update with:</p>
                </div>
                <pre className="mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive">
                  <code className="text-sm text-foreground">
                    Activation was not successful. Check the logs for more info
                  </code>
                </pre>
              </div>
            ),
          });
      })
      .catch(error => {
        dismiss();
        toast({
          title: 'SMS',
          description: (
            <div className={'flex flex-col'}>
              <div className={'flex flex-row text-destructive items-center'}>
                <LucideX className={'w-8 h-8'} />
                <p className="text-sm">Failed to update with:</p>
              </div>
              <pre className="mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive">
                <code className="text-sm text-foreground">{error.message}</code>
              </pre>
            </div>
          ),
        });
      });
  };

  const handleSwitchChange = () => {
    addAlert({
      title: 'SMS Module',
      description: `Are you sure you want to ${smsModule ? 'disable' : 'enable'} SMS module?`,
      cancelText: 'Cancel',
      actionText: 'Proceed',
      onDecision: cancel => {
        if (!cancel) {
          const { id, dismiss } = toast({
            title: 'SMS',
            description: (
              <div className={'flex flex-row items-center space-x-2.5'}>
                <LoaderIcon className={'w-8 h-8 animate-spin'} />
                <p className="text-sm text-foreground">
                  Updating SMS Settings...
                </p>
              </div>
            ),
          });
          const updatedSettings = {
            active: !smsModule,
            ...(!smsModule && { providerName: 'twilio' }),
          };
          setValue('providerName', 'local');
          setSmsModule(!smsModule);
          patchSmsSettings(updatedSettings)
            .then(res => {
              dismiss();
              toast({
                title: 'SMS',
                description: (
                  <div className={'flex flex-row items-center space-x-2.5'}>
                    <CheckIcon className={'w-8 h-8'} />
                    <p className="text-sm text-foreground">
                      SMS Settings Updated!
                    </p>
                  </div>
                ),
              });
            })
            .catch(err => {
              dismiss();
              setSmsModule(data.active);
              setValue('providerName', data.providerName);
              toast({
                title: 'SMS',
                description: (
                  <div className={'flex flex-col'}>
                    <div
                      className={'flex flex-row text-destructive items-center'}
                    >
                      <LucideX className={'w-8 h-8'} />
                      <p className="text-sm">Failed to update with:</p>
                    </div>
                    <pre className="mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive">
                      <code className="text-sm text-foreground">
                        {err.message}
                      </code>
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
        <div className="space-y-0.5">
          <div className={'flex gap-2 items-center'}>
            <p className="text-2xl font-medium">SMS Module</p>
            <Switch
              checked={smsModule}
              onCheckedChange={() => {
                handleSwitchChange();
              }}
            />
          </div>
          <div className={'pr-2'}>
            <p className={'text-xs text-[#94A3B8]'}>
              To an idea on how to setup your SMS provider take a look at the
              documentation.
            </p>
          </div>
        </div>
        {smsModule && (
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <SettingsForm
                control={control}
                edit={edit}
                setEdit={setEdit}
                watch={watch}
                reset={reset}
                data={data}
              />
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};
