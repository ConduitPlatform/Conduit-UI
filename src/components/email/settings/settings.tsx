'use client';
import { EmailSettings } from '@/lib/models/email';
import { useEffect, useState } from 'react';
import { useAlerts } from '@/components/providers/AlertProvider';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { rhfZodResolver } from '@/lib/zod-form';
import { patchEmailSettings } from '@/lib/api/email';
import { useRouter } from 'next/navigation';
import { Form } from '@/components/ui/form';
import { SettingsForm } from '@/components/email/settings/settingsForm';
import { isEmpty } from 'lodash';
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
  data: EmailSettings;
  embedded?: boolean;
}

const EMAIL_MODULE_NAMES = ['communications', 'email'] as const;

const FormSchema = z
  .object({
    active: z.boolean(),
    sendingDomain: z.string({
      error: 'You need to provide the Sending Domain',
    }),
    storeEmails: z.object({
      enabled: z.boolean().default(false),
      storage: z.object({
        enabled: z.boolean().default(false),
        container: z.string(),
        folder: z.string(),
      }),
      cleanupSettings: z.object({
        enabled: z.boolean().default(false),
        repeat: z.number().int(),
        limit: z.number().int(),
      }),
    }),
    transport: z.union([
      z.literal('mailgun'),
      z.literal('smtp'),
      z.literal('mandrill'),
      z.literal('sendgrid'),
      z.literal('mailersend'),
      z.literal('amazonSes'),
    ]),
    transportSettings: z.object({
      mailgun: z.object({
        apiKey: z.string(),
        host: z.string(),
        proxy: z.string().optional(),
      }),
      smtp: z.object({
        port: z.number().int().default(587),
        host: z.string(),
        secure: z.boolean(),
        ignoreTls: z.boolean(),
        auth: z.object({
          username: z.string(),
          password: z.string(),
          method: z.string(),
        }),
      }),
      mandrill: z.object({
        apiKey: z.string(),
      }),
      sendgrid: z.object({
        apiKey: z.string(),
        residency: z.string(),
      }),
      mailersend: z.object({
        host: z.string(),
        port: z.number().int().default(587),
        apiKey: z.string(),
      }),
      amazonSes: z.object({
        region: z.string(),
        accessKeyId: z.string(),
        secretAccessKey: z.string(),
      }),
    }),
  })
  .refine(
    schema => {
      switch (schema.transport) {
        case 'mailgun':
          return !isEmpty(schema.transportSettings.mailgun);
        case 'smtp':
          return !isEmpty(schema.transportSettings.smtp);
        case 'mandrill':
          return !isEmpty(schema.transportSettings.mandrill);
        case 'sendgrid':
          return !isEmpty(schema.transportSettings.sendgrid);
        case 'mailersend':
          return !isEmpty(schema.transportSettings.mailersend);
        case 'amazonSes':
          return !isEmpty(schema.transportSettings.amazonSes);
        default:
          return false;
      }
    },
    {
      message: 'You need to fill in all the fields below for this transport',
      path: ['transport'],
    }
  );

function isEmailActivationSuccess(result: PatchSettingsResult | void) {
  if (!result) return true;
  return isCommunicationsModuleServing(result.modules, EMAIL_MODULE_NAMES);
}

export const Settings = ({ data, embedded = false }: Props) => {
  const [emailModule, setEmailModule] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const { addAlert } = useAlerts();
  const { save, isSaving } = useSettingsSave('Email');
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: rhfZodResolver(FormSchema),
    defaultValues: data,
  });
  const { reset, setValue } = form;

  useEffect(() => {
    if (data) {
      setEmailModule(data.active);
      reset(data);
    }
  }, [data, reset]);

  const handleSwitchChange = () => {
    addAlert({
      title: 'Email Module',
      description: `Are you sure you want to ${emailModule ? 'disable' : 'enable'} email module?`,
      cancelText: 'Cancel',
      actionText: 'Proceed',
      onDecision: cancel => {
        if (cancel) return;

        const nextActive = !emailModule;
        setEmailModule(nextActive);
        setValue('active', nextActive);

        void save({
          action: () =>
            patchEmailSettings(
              { active: nextActive },
              activeTogglePatchOptions([...EMAIL_MODULE_NAMES], nextActive)
            ),
          isActivationSuccess: isEmailActivationSuccess,
          onSuccess: () => router.refresh(),
          onError: () => {
            setEmailModule(data.active);
            setValue('active', data.active);
          },
          onActivationFailure: () => {
            setEmailModule(data.active);
            setValue('active', data.active);
          },
        });
      },
    });
  };

  const onSubmit = async (formData: z.infer<typeof FormSchema>) => {
    const result = await save({
      action: () => patchEmailSettings({ ...formData, active: emailModule }),
      onSuccess: () => router.refresh(),
    });
    if (result.ok) {
      setEdit(false);
    }
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
          label="Email Module"
          checked={emailModule}
          isSaving={isSaving}
          onCheckedChange={handleSwitchChange}
        />
        <div className={'pr-2 w-7/12'}>
          <p className={'text-xs text-muted-foreground'}>
            Since you have created an account on one of the Supported Providers
            (Mailgun, Sendgrid, Mandrill, Smtp), you need to configure the
            provider to proceed with the activation of the module. Visit
            documentation for{' '}
            <a
              href={'https://getconduit.dev/docs/modules/email/config#mandrill'}
              className="hover:underline"
              target={'_blank'}
            >
              Mandrill
            </a>
            ,{' '}
            <a
              href={'https://getconduit.dev/docs/modules/email/config#sendgrid'}
              className="hover:underline"
              target={'_blank'}
            >
              Sendgrid
            </a>
            .
          </p>
        </div>
      </div>
      {emailModule && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, () => undefined)}>
            <SettingsForm
              edit={edit}
              isSaving={isSaving}
              setEdit={setEdit}
              data={data}
            />
          </form>
        </Form>
      )}
    </div>
  );
};
