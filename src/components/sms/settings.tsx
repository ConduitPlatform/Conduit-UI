'use client';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { rhfZodResolver } from '@/lib/zod-form';
import { useAlerts } from '@/components/providers/AlertProvider';
import { Form } from '@/components/ui/form';
import { SmsSettings } from '@/lib/models/Sms';
import { isEmpty } from 'lodash';
import { patchSmsSettings } from '@/lib/api/sms';
import { SettingsForm } from '@/components/sms/settingsForm';
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
  data: SmsSettings;
  embedded?: boolean;
}

const SMS_MODULE_NAMES = ['communications', 'sms'] as const;

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

function isSmsActivationSuccess(result: PatchSettingsResult | void) {
  if (!result) return true;
  return isCommunicationsModuleServing(result.modules, SMS_MODULE_NAMES);
}

export const Settings = ({ data, embedded = false }: Props) => {
  const [smsModule, setSmsModule] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const { addAlert } = useAlerts();
  const { save, isSaving } = useSettingsSave('SMS');
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: rhfZodResolver(FormSchema),
    defaultValues: data,
  });
  const { setValue, reset, control, handleSubmit, watch } = form;

  useEffect(() => {
    if (data) {
      setSmsModule(data.active);
    }
  }, [data]);

  const onSubmit = async (formData: z.infer<typeof FormSchema>) => {
    const result = await save({
      action: () => patchSmsSettings(formData),
    });
    if (result.ok) {
      setEdit(false);
    }
  };

  const handleSwitchChange = () => {
    addAlert({
      title: 'SMS Module',
      description: `Are you sure you want to ${smsModule ? 'disable' : 'enable'} SMS module?`,
      cancelText: 'Cancel',
      actionText: 'Proceed',
      onDecision: cancel => {
        if (cancel) return;

        const nextActive = !smsModule;
        const updatedSettings = {
          active: nextActive,
          ...(!nextActive ? {} : { providerName: 'twilio' }),
        };
        setValue('providerName', nextActive ? 'twilio' : data.providerName);
        setSmsModule(nextActive);

        void save({
          action: () =>
            patchSmsSettings(
              updatedSettings,
              activeTogglePatchOptions([...SMS_MODULE_NAMES], nextActive)
            ),
          isActivationSuccess: isSmsActivationSuccess,
          onError: () => {
            setSmsModule(data.active);
            setValue('providerName', data.providerName);
          },
          onActivationFailure: () => {
            setSmsModule(data.active);
            setValue('providerName', data.providerName);
          },
        });
      },
    });
  };

  return (
    <div
      className={
        embedded
          ? 'space-y-6'
          : 'container mx-auto py-10 main-scrollbar flex flex-col gap-6'
      }
    >
      <div className="space-y-0.5">
        <ModuleToggle
          label="SMS Module"
          checked={smsModule}
          isSaving={isSaving}
          onCheckedChange={handleSwitchChange}
        />
        <div className={'pr-2'}>
          <p className={'text-xs text-muted-foreground'}>
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
              isSaving={isSaving}
              setEdit={setEdit}
              watch={watch}
              reset={reset}
              data={data}
            />
          </form>
        </Form>
      )}
    </div>
  );
};
