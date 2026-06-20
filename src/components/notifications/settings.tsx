'use client';
import { z } from 'zod';
import { toast } from '@/lib/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { rhfZodResolver } from '@/lib/zod-form';
import { Form } from '@/components/ui/form';
import { useAlerts } from '@/components/providers/AlertProvider';
import { patchNotificationSettings } from '@/lib/api/notifications';
import { NotificationSettings } from '@/lib/models/Notification';
import { SettingsForm } from '@/components/notifications/settingsForm';
import {
  activeTogglePatchOptions,
  useSettingsSave,
} from '@/lib/hooks/use-settings-save';
import { ModuleToggle } from '@/components/settings/ModuleToggle';
import {
  isCommunicationsModuleServing,
  PatchSettingsResult,
} from '@/lib/api/modules/patch-settings-options';

interface Props {
  data: NotificationSettings;
}

const PUSH_MODULE_NAMES = ['communications', 'pushNotifications'] as const;

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

function buildNotificationPayload(
  formData: z.infer<typeof FormSchema>
): Partial<NotificationSettings> {
  const notificationData: Partial<NotificationSettings> = {
    providerName: formData.providerName,
    firebase: undefined,
    onesignal: undefined,
    sns: undefined,
  };

  if (
    formData.providerName === 'firebase' &&
    formData.privateKey &&
    formData.projectId &&
    formData.clientEmail
  ) {
    notificationData.firebase = {
      projectId: formData.projectId,
      privateKey: formData.privateKey,
      clientEmail: formData.clientEmail,
    };
  }

  if (
    formData.providerName === 'oneSignal' &&
    formData.appId &&
    formData.apiKey
  ) {
    notificationData.onesignal = {
      appId: formData.appId,
      apiKey: formData.apiKey,
    };
  }

  if (
    formData.providerName === 'sns' &&
    formData.snsAccessKeyId &&
    formData.snsSecretAccessKey &&
    formData.snsRegion &&
    formData.snsGcmApplicationArn &&
    formData.snsApnsApplicationArn
  ) {
    notificationData.sns = {
      accessKeyId: formData.snsAccessKeyId,
      secretAccessKey: formData.snsSecretAccessKey,
      region: formData.snsRegion,
      gcmApplicationArn: formData.snsGcmApplicationArn,
      apnsApplicationArn: formData.snsApnsApplicationArn,
    };
  }

  return notificationData;
}

function isPushActivationSuccess(result: PatchSettingsResult | void) {
  if (!result) return true;
  return isCommunicationsModuleServing(result.modules, PUSH_MODULE_NAMES);
}

export const Settings = ({ data }: Props) => {
  const [notificationModule, setNotificationModule] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const { addAlert } = useAlerts();
  const { save, isSaving } = useSettingsSave('Notifications');

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

  const onSubmit = async (formData: z.infer<typeof FormSchema>) => {
    const result = await save({
      action: () =>
        patchNotificationSettings(buildNotificationPayload(formData)),
    });
    if (result.ok) {
      setEdit(false);
    }
  };

  const handleSwitchChange = () => {
    addAlert({
      title: 'Push Notification Module',
      description: `Are you sure you want to ${notificationModule ? 'disable' : 'enable'} push notification module?`,
      cancelText: 'Cancel',
      actionText: 'Proceed',
      onDecision: cancel => {
        if (cancel) return;

        const nextActive = !notificationModule;
        const updatedSettings = {
          active: nextActive,
          ...(!nextActive ? {} : { providerName: 'basic' as const }),
        };
        setValue('providerName', nextActive ? 'basic' : data.providerName);
        setNotificationModule(nextActive);

        void save({
          action: () =>
            patchNotificationSettings(
              updatedSettings,
              activeTogglePatchOptions([...PUSH_MODULE_NAMES], nextActive)
            ),
          isActivationSuccess: isPushActivationSuccess,
          onError: () => {
            setNotificationModule(data.active);
            setValue('providerName', data.providerName);
          },
          onActivationFailure: () => {
            setNotificationModule(data.active);
            setValue('providerName', data.providerName);
          },
        });
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
        } catch {
          toast({
            title: 'Invalid Firebase config file',
            variant: 'destructive',
          });
        }
      }
    };
  };

  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <div className={'flex flex-col gap-6'}>
        <div className="space-y-0.5">
          <ModuleToggle
            label="Push Notifications Module"
            checked={notificationModule}
            isSaving={isSaving}
            onCheckedChange={handleSwitchChange}
          />
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
                isSaving={isSaving}
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
