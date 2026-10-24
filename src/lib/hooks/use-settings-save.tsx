'use client';

import { useCallback, useState } from 'react';
import { toast } from '@/lib/hooks/use-toast';
import { ErrorPre } from '@/components/ui/error-pre';
import { PatchSettingsOptions } from '@/lib/api/modules/patch-settings-options';

export type SettingsSaveOptions<T = void> = {
  action: () => Promise<T>;
  successMessage?: string;
  activationFailureMessage?: string;
  isActivationSuccess?: (result: T) => boolean;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  onActivationFailure?: (result: T) => void;
};

export function useSettingsSave(label: string) {
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(
    async <T,>(options: SettingsSaveOptions<T>) => {
      const {
        action,
        successMessage = `${label} settings saved`,
        activationFailureMessage = 'Activation was not successful. Check the logs for more info',
        isActivationSuccess,
        onSuccess,
        onError,
        onActivationFailure,
      } = options;

      setIsSaving(true);
      try {
        const result = await action();

        if (isActivationSuccess && !isActivationSuccess(result)) {
          onActivationFailure?.(result);
          toast({
            title: label,
            description: <ErrorPre>{activationFailureMessage}</ErrorPre>,
            variant: 'destructive',
          });
          return { ok: false as const, result };
        }

        onSuccess?.(result);
        toast({ title: successMessage });
        return { ok: true as const, result };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        toast({
          title: `Failed to save ${label.toLowerCase()} settings`,
          description: <ErrorPre>{err.message}</ErrorPre>,
          variant: 'destructive',
        });
        return { ok: false as const, error: err };
      } finally {
        setIsSaving(false);
      }
    },
    [label]
  );

  return { save, isSaving };
}

export function activeTogglePatchOptions(
  moduleNames: string[],
  active: boolean
): PatchSettingsOptions {
  return {
    waitForServing: true,
    expectedServing: active,
    moduleNames,
  };
}
