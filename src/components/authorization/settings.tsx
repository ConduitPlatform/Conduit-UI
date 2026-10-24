'use client';
import { useEffect, useState } from 'react';
import { useAlerts } from '@/components/providers/AlertProvider';
import { patchAuthorizationSettings } from '@/lib/api/authorization';
import { AuthorizationSettings } from '@/lib/models/authorization/settings';
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
  data: AuthorizationSettings;
}

function isAuthorizationActivationSuccess(
  result: PatchSettingsResult | void,
  expectedActive: boolean
) {
  if (!expectedActive || !result) return true;
  return isModuleServing(result.modules, 'authorization');
}

export const Settings = ({ data }: Props) => {
  const [authorizationModule, setAuthorizationModule] =
    useState<boolean>(false);
  const { addAlert } = useAlerts();
  const { save, isSaving } = useSettingsSave('Authorization');

  useEffect(() => {
    if (data) {
      setAuthorizationModule(data.active);
    }
  }, [data]);

  const handleSwitchChange = () => {
    addAlert({
      title: 'Authorization Module',
      description: `Are you sure you want to ${authorizationModule ? 'disable' : 'enable'} Authorization module?`,
      cancelText: 'Cancel',
      actionText: 'Proceed',
      onDecision: cancel => {
        if (cancel) return;

        const nextActive = !authorizationModule;
        setAuthorizationModule(nextActive);

        void save({
          action: () =>
            patchAuthorizationSettings(
              { active: nextActive },
              activeTogglePatchOptions(['authorization'], nextActive)
            ),
          isActivationSuccess: result =>
            isAuthorizationActivationSuccess(result, nextActive),
          onError: () => setAuthorizationModule(data.active),
          onActivationFailure: () => setAuthorizationModule(data.active),
        });
      },
    });
  };

  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <div className={'flex flex-col gap-6'}>
        <div className="space-y-0.5">
          <ModuleToggle
            label="Authorization Module"
            checked={authorizationModule}
            isSaving={isSaving}
            onCheckedChange={handleSwitchChange}
          />
          <div className={'pr-2'}>
            <p className={'text-xs text-muted-foreground'}>
              To see more information regarding Authorization config, visit our
              docs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
