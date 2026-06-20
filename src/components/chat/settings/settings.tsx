'use client';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { rhfZodResolver } from '@/lib/zod-form';
import { useAlerts } from '@/components/providers/AlertProvider';
import { Form } from '@/components/ui/form';
import { patchChatSettings } from '@/lib/api/chat';
import { ChatSettings } from '@/lib/models/chat';
import { SettingsForm } from '@/components/chat/settings/settingsForm';
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

function isChatActivationSuccess(result: PatchSettingsResult | void) {
  if (!result) return true;
  return isModuleServing(result.modules, 'chat');
}

export const Settings = ({
  data,
  emailAvailable,
  pushNotificationsAvailable,
}: Props) => {
  const [chatModule, setChatModule] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const { addAlert } = useAlerts();
  const { save, isSaving } = useSettingsSave('Chat');
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: rhfZodResolver(FormSchema),
    defaultValues: data,
  });

  useEffect(() => {
    if (data) {
      setChatModule(data.active);
    }
  }, [data]);

  const onSubmit = async (formData: z.infer<typeof FormSchema>) => {
    const result = await save({
      action: () => patchChatSettings(formData),
    });
    if (result.ok) {
      setEdit(false);
    }
  };

  const handleSwitchChange = () => {
    addAlert({
      title: 'Chat Module',
      description: `Are you sure you want to ${chatModule ? 'disable' : 'enable'} Chat module?`,
      cancelText: 'Cancel',
      actionText: 'Proceed',
      onDecision: cancel => {
        if (cancel) return;

        const nextActive = !chatModule;
        setChatModule(nextActive);

        void save({
          action: () =>
            patchChatSettings(
              { active: nextActive },
              activeTogglePatchOptions(['chat'], nextActive)
            ),
          isActivationSuccess: isChatActivationSuccess,
          onError: () => setChatModule(data.active),
          onActivationFailure: () => setChatModule(data.active),
        });
      },
    });
  };

  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <div className={'flex flex-col gap-6'}>
        <div className="space-y-0.5">
          <ModuleToggle
            label="Chat Module"
            checked={chatModule}
            isSaving={isSaving}
            onCheckedChange={handleSwitchChange}
          />
          <div className={'pr-2'}>
            <p className={'text-xs text-muted-foreground'}>
              To get an idea on how to setup Chat take a look at our
              documentation.
            </p>
          </div>
        </div>
        {chatModule && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <SettingsForm
                edit={edit}
                isSaving={isSaving}
                setEdit={setEdit}
                emailAvailable={emailAvailable}
                pushNotificationsAvailable={pushNotificationsAvailable}
              />
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};
