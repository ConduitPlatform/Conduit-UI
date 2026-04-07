'use client';
import { z } from 'zod';
import { toast } from '@/lib/hooks/use-toast';
import { CheckIcon, LoaderIcon, LucideX } from 'lucide-react';
import { ErrorPre } from '@/components/ui/error-pre';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { rhfZodResolver } from '@/lib/zod-form';
import { Form } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useAlerts } from '@/components/providers/AlertProvider';
import { patchNotificationSettings } from '@/lib/api/notifications';
import { NotificationSettings } from '@/lib/models/Notification';
import { SettingsForm } from '@/components/notifications/settingsForm';

interface Props {
  data: NotificationSettings;
}

const FormSchema = z
  .object({
    providerName: z.enum(['firebase', 'oneSignal', 'sns', 'basic']),
    appId: z.string().optional(),
    apiKey: z.string().optional(),
    projectId: z.string().optional(),
    clientEmail: z.string().optional(),
    privateKey: z.string().optional(),
    snsAccessKeyId: z.string().optional(),
    snsSecretAccessKey: z.string().optional(),
    snsRegion: z.string().optional(),
    snsGcmApplicationArn: z.string().optional(),
    snsApnsApplicationArn: z.string().optional(),
  })
  .refine(
    schema => {
      if (
        schema.providerName === 'oneSignal' &&
        (schema.apiKey === '' || schema.appId === '')
      )
        return false;
      if (
        schema.providerName === 'firebase' &&
        (schema.projectId === '' ||
          schema.clientEmail === '' ||
          schema.privateKey === '')
      )
        return false;
      if (
        schema.providerName === 'sns' &&
        (schema.snsAccessKeyId === '' ||
          schema.snsSecretAccessKey === '' ||
          schema.snsRegion === '' ||
          schema.snsGcmApplicationArn === '' ||
          schema.snsApnsApplicationArn === '')
      )
        return false;
      return true;
    },
    {
      message: 'You need to fill in all the fields below for this provider',
      path: ['providerName'],
    }
  );

export const Settings = ({ data }: Props) => {
  const [notificationModule, setNotificationModule] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const { addAlert } = useAlerts();

  useEffect(() => {
    if (data) {
      setNotificationModule(data.active);
    }
  }, [data]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: rhfZodResolver(FormSchema),
    defaultValues: {
      providerName: data.providerName,
      appId: data.onesignal?.appId,
      apiKey: data.onesignal?.apiKey,
      projectId: data.firebase?.projectId,
      clientEmail: data.firebase?.clientEmail,
      privateKey: data.firebase?.privateKey,
      snsAccessKeyId: data.sns?.accessKeyId,
      snsSecretAccessKey: data.sns?.secretAccessKey,
      snsRegion: data.sns?.region,
      snsGcmApplicationArn: data.sns?.gcmApplicationArn,
      snsApnsApplicationArn: data.sns?.apnsApplicationArn,
    },
  });

  const { reset, control, handleSubmit, setValue, watch } = form;

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setEdit(false);
    const { id, dismiss } = toast({
      title: 'Notifications',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <LoaderIcon className={'w-8 h-8 animate-spin'} />
          <p className="text-sm text-foreground">
            Updating Notification Settings...
          </p>
        </div>
      ),
    });
    const notificationData: Partial<NotificationSettings> = {
      providerName: data.providerName,
      firebase: undefined,
      onesignal: undefined,
      sns: undefined,
    };
    if (
      data.providerName === 'firebase' &&
      data.privateKey &&
      data.projectId &&
      data.clientEmail
    ) {
      notificationData.firebase = {
        projectId: data.projectId,
        privateKey: data.privateKey,
        clientEmail: data.clientEmail,
      };
    }
    if (data.providerName === 'oneSignal' && data.appId && data.apiKey) {
      notificationData.onesignal = {
        appId: data.appId,
        apiKey: data.apiKey,
      };
    }
    if (
      data.providerName === 'sns' &&
      data.snsAccessKeyId &&
      data.snsSecretAccessKey &&
      data.snsRegion &&
      data.snsGcmApplicationArn &&
      data.snsApnsApplicationArn
    ) {
      notificationData.sns = {
        accessKeyId: data.snsAccessKeyId,
        secretAccessKey: data.snsSecretAccessKey,
        region: data.snsRegion,
        gcmApplicationArn: data.snsGcmApplicationArn,
        apnsApplicationArn: data.snsApnsApplicationArn,
      };
    }
    patchNotificationSettings(notificationData)
      .then(res => {
        dismiss();
        const notifModule = res.find(
          module => module.moduleName === 'pushNotifications'
        );
        if (notifModule && notifModule.serving)
          toast({
            title: 'Notifications',
            description: (
              <div className={'flex flex-row items-center space-x-2.5'}>
                <CheckIcon className={'w-8 h-8'} />
                <p className="text-sm text-foreground">
                  Notification Settings Updated!
                </p>
              </div>
            ),
          });
        else
          toast({
            title: 'Notifications',
            description: (
              <div className={'flex flex-col'}>
                <div className={'flex flex-row text-destructive items-center'}>
                  <LucideX className={'w-8 h-8'} />
                  <p className="text-sm">Failed to add with:</p>
                </div>
                <ErrorPre>
                  Activation was not successful. Check the logs for more info
                </ErrorPre>
              </div>
            ),
          });
      })
      .catch(error => {
        dismiss();
        toast({
          title: 'Notifications',
          description: (
            <div className={'flex flex-col'}>
              <div className={'flex flex-row text-destructive items-center'}>
                <LucideX className={'w-8 h-8'} />
                <p className="text-sm">Failed to add with:</p>
              </div>
              <ErrorPre>{error.message}</ErrorPre>
            </div>
          ),
        });
      });
  };

  const handleSwitchChange = () => {
    addAlert({
      title: 'Push Notification Module',
      description: `Are you sure you want to ${notificationModule ? 'disable' : 'enable'} push notification module?`,
      cancelText: 'Cancel',
      actionText: 'Proceed',
      onDecision: cancel => {
        if (!cancel) {
          const { id, dismiss } = toast({
            title: 'Notifications',
            description: (
              <div className={'flex flex-row items-center space-x-2.5'}>
                <LoaderIcon className={'w-8 h-8 animate-spin'} />
                <p className="text-sm text-foreground">
                  Updating Notification Settings...
                </p>
              </div>
            ),
          });
          const updatedSettings = {
            active: !notificationModule,
            ...(!notificationModule && { providerName: 'basic' as 'basic' }),
          };
          setValue('providerName', 'basic');
          setNotificationModule(!notificationModule);
          patchNotificationSettings(updatedSettings)
            .then(res => {
              dismiss();
              toast({
                title: 'Notifications',
                description: (
                  <div className={'flex flex-row items-center space-x-2.5'}>
                    <CheckIcon className={'w-8 h-8'} />
                    <p className="text-sm text-foreground">
                      Notification Settings Updated!
                    </p>
                  </div>
                ),
              });
            })
            .catch(err => {
              dismiss();
              setNotificationModule(data.active);
              setValue('providerName', data.providerName);
              toast({
                title: 'Notifications',
                description: (
                  <div className={'flex flex-col'}>
                    <div
                      className={'flex flex-row text-destructive items-center'}
                    >
                      <LucideX className={'w-8 h-8'} />
                      <p className="text-sm">Failed to update with:</p>
                    </div>
                    <ErrorPre>{err.message}</ErrorPre>
                  </div>
                ),
              });
            });
        }
      },
    });
  };

  const handleFileChange = (file: File) => {
    const firebaseConfigSchema = z.object({
      type: z.literal('service_account'),
      project_id: z.string(),
      private_key_id: z.string(),
      private_key: z.string(),
      client_email: z.string().email(),
      client_id: z.string(),
      auth_uri: z.string().url(),
      token_uri: z.string().url(),
      auth_provider_x509_cert_url: z.string().url(),
      client_x509_cert_url: z.string().url(),
    });

    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = event => {
      if (event.target && typeof event.target.result === 'string') {
        const jsonToObject = JSON.parse(event.target.result);
        try {
          // Validate the JSON data against the schema
          firebaseConfigSchema.parse(jsonToObject);
          if (
            'project_id' in jsonToObject &&
            'private_key' in jsonToObject &&
            'client_email' in jsonToObject
          ) {
            setValue('projectId', jsonToObject.project_id);
            setValue('privateKey', jsonToObject.private_key);
            setValue('clientEmail', jsonToObject.client_email);
          }
        } catch (error) {
          toast({
            title: 'Notifications',
            description: (
              <div className={'flex flex-col'}>
                <div className={'flex flex-row text-destructive items-center'}>
                  <LucideX className={'w-8 h-8'} />
                  <p className="text-sm">Failed to update with:</p>
                </div>
                <ErrorPre>The file is not valid</ErrorPre>
              </div>
            ),
          });
        }
      }
    };
  };

  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <div className={'flex flex-col gap-6'}>
        <div className="space-y-0.5">
          <div className={'flex gap-2 items-center'}>
            <p className="text-2xl font-medium">Push Notifications Module</p>
            <Switch
              checked={notificationModule}
              onCheckedChange={() => {
                handleSwitchChange();
              }}
            />
          </div>
          <div className={'pr-2'}>
            <p className={'text-xs text-muted-foreground'}>
              To see more information regarding the Push Notifications config,
              visit our{' '}
              <a
                href={
                  'https://getconduit.dev/docs/modules/push-notifications/config'
                }
                className="hover:underline"
                target={'_blank'}
              >
                docs
              </a>
              .
            </p>
          </div>
        </div>
        {notificationModule && (
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <SettingsForm
                control={control}
                edit={edit}
                setEdit={setEdit}
                watch={watch}
                reset={reset}
                handleFileChange={handleFileChange}
                data={data}
              />
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};
