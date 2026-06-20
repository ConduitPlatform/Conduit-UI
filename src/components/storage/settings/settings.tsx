'use client';
import { z } from 'zod';
import { StorageSettings } from '@/lib/models/storage';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { rhfZodResolver } from '@/lib/zod-form';
import { useAlerts } from '@/components/providers/AlertProvider';
import { Form } from '@/components/ui/form';
import { SettingsForm } from '@/components/storage/settings/settingsForm';
import { patchStorageSettings } from '@/lib/api/storage';
import { FormSchema } from '@/components/storage/settings/zod';
import {
  activeTogglePatchOptions,
  useSettingsSave,
} from '@/lib/hooks/use-settings-save';
import { ModuleToggle } from '@/components/settings/ModuleToggle';
import {
  isModuleServing,
  PatchSettingsResult,
} from '@/lib/api/modules/patch-settings-options';

interface Props {
  data: StorageSettings;
  authzAvailable: boolean;
}

function isStorageActivationSuccess(result: PatchSettingsResult | void) {
  if (!result) return true;
  return isModuleServing(result.modules, 'storage');
}

export const Settings = ({ data, authzAvailable }: Props) => {
  const [storageModule, setStorageModule] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const { addAlert } = useAlerts();
  const { save, isSaving } = useSettingsSave('Storage');
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: rhfZodResolver(FormSchema),
    defaultValues: data,
  });
  const { setValue, reset, control, handleSubmit, watch } = form;

  useEffect(() => {
    if (data) {
      setStorageModule(data.active);
    }
  }, [data]);

  const onSubmit = async (formData: z.infer<typeof FormSchema>) => {
    const result = await save({
      action: () => patchStorageSettings(formData),
    });
    if (result.ok) {
      setEdit(false);
    }
  };

  const handleSwitchChange = () => {
    addAlert({
      title: 'Storage Module',
      description: `Are you sure you want to ${storageModule ? 'disable' : 'enable'} storage module?`,
      cancelText: 'Cancel',
      actionText: 'Proceed',
      onDecision: cancel => {
        if (cancel) return;

        const nextActive = !storageModule;
        const updatedSettings: Partial<StorageSettings> = {
          active: nextActive,
          ...(!nextActive ? {} : { provider: 'local' }),
        };
        if (nextActive) {
          setValue('provider', 'local');
        }
        setStorageModule(nextActive);

        void save({
          action: () =>
            patchStorageSettings(
              updatedSettings,
              activeTogglePatchOptions(['storage'], nextActive)
            ),
          isActivationSuccess: isStorageActivationSuccess,
          onError: () => {
            setStorageModule(data.active);
            setValue('provider', data.provider);
          },
          onActivationFailure: () => {
            setStorageModule(data.active);
            setValue('provider', data.provider);
          },
        });
      },
    });
  };

  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <div className={'flex flex-col gap-6'}>
        <div className="space-y-0.5">
          <ModuleToggle
            label="Storage Module"
            checked={storageModule}
            isSaving={isSaving}
            onCheckedChange={handleSwitchChange}
          />
          <div className={'pr-2'}>
            <p className={'text-xs text-muted-foreground'}>
              To get an idea on how to setup your storage provider take a look
              at the documentation for{' '}
              <a
                href={
                  'https://getconduit.dev/docs/modules/storage/config#azure-storage'
                }
                className="hover:underline"
                target={'_blank'}
              >
                azure
              </a>
              ,{' '}
              <a
                href={
                  'https://getconduit.dev/docs/modules/storage/config#google-storage'
                }
                className="hover:underline"
                target={'_blank'}
              >
                google
              </a>
              ,{' '}
              <a
                href={
                  'https://getconduit.dev/docs/modules/storage/config#amazon-storage'
                }
                className="hover:underline"
                target={'_blank'}
              >
                aws
              </a>{' '}
              or{' '}
              <a
                href={
                  'https://getconduit.dev/docs/modules/storage/config#local-storage'
                }
                className="hover:underline"
                target={'_blank'}
              >
                local
              </a>{' '}
              provider.
            </p>
          </div>
        </div>
        {storageModule && (
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
                authzAvailable={authzAvailable}
              />
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};
