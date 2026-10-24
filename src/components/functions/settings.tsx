'use client';
import { useEffect, useState } from 'react';
import { useAlerts } from '@/components/providers/AlertProvider';
import { FunctionsSettings } from '@/lib/models/functions';
import { patchFunctionsSettings } from '@/lib/api/functions';
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
  data: FunctionsSettings;
}

function isFunctionsActivationSuccess(
  result: PatchSettingsResult | void,
  expectedActive: boolean
) {
  if (!expectedActive || !result) return true;
  return isModuleServing(result.modules, 'functions');
}

export const Settings = ({ data }: Props) => {
  const [functionsModule, setFunctionsModule] = useState<boolean>(false);
  const { addAlert } = useAlerts();
  const { save, isSaving } = useSettingsSave('Functions');

  useEffect(() => {
    if (data) {
      setFunctionsModule(data.active);
    }
  }, [data]);

  const handleSwitchChange = () => {
    addAlert({
      title: 'Functions Module',
      description: `Are you sure you want to ${functionsModule ? 'disable' : 'enable'} functions module?`,
      cancelText: 'Cancel',
      actionText: 'Proceed',
      onDecision: cancel => {
        if (cancel) return;

        const nextActive = !functionsModule;
        setFunctionsModule(nextActive);

        void save({
          action: () =>
            patchFunctionsSettings(
              { active: nextActive },
              activeTogglePatchOptions(['functions'], nextActive)
            ),
          isActivationSuccess: result =>
            isFunctionsActivationSuccess(result, nextActive),
          onError: () => setFunctionsModule(data.active),
          onActivationFailure: () => setFunctionsModule(data.active),
        });
      },
    });
  };

  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <div className={'flex flex-col gap-6'}>
        <div className="space-y-0.5">
          <ModuleToggle
            label="Functions Module"
            checked={functionsModule}
            isSaving={isSaving}
            onCheckedChange={handleSwitchChange}
          />
          <div className={'pr-2 space-y-2'}>
            <p className={'text-xs text-muted-foreground'}>
              Functions execute with the same privileges as the Conduit server.
              Only enable if you trust all admin users to author safe code.
            </p>
            <p className={'text-xs text-muted-foreground'}>
              To see more information regarding the Functions config, visit our
              docs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
