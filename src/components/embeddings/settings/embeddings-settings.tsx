'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Form } from '@/components/ui/form';
import { ModuleToggle } from '@/components/settings/ModuleToggle';
import { SettingsForm } from '@/components/embeddings/settings/settings-form';
import { embeddingsSettingsFormSchema } from '@/components/embeddings/settings/schema';
import {
  isCancelShortcut,
  useSaveShortcut,
  useSaveShortcutLabel,
} from '@/components/embeddings/configs/use-save-shortcut';
import { useAlerts } from '@/components/providers/AlertProvider';
import {
  activeTogglePatchOptions,
  useSettingsSave,
} from '@/lib/hooks/use-settings-save';
import { patchEmbeddingsSettings } from '@/lib/api/embeddings';
import {
  isModuleServing,
  PatchSettingsResult,
} from '@/lib/api/modules/patch-settings-options';
import type { EmbeddingsSettings as EmbeddingsModuleSettings } from '@/lib/models/embeddings/settings';
import {
  toSettingsFormValues,
  toSettingsPatch,
} from '@/lib/models/embeddings/settings-form';
import { rhfZodResolver } from '@/lib/zod-form';
import { cn } from '@/lib/utils';

type EmbeddingsSettingsProps = {
  data: EmbeddingsModuleSettings;
  serving?: boolean;
};

function isWorkersPatchSuccess(result: PatchSettingsResult | void) {
  if (!result) return true;
  return isModuleServing(result.modules, 'embeddings');
}

export function EmbeddingsSettings({ data, serving }: EmbeddingsSettingsProps) {
  const router = useRouter();
  const { addAlert } = useAlerts();
  const { save, isSaving } = useSettingsSave('Embeddings');
  const shortcutLabel = useSaveShortcutLabel();
  const [workersEnabled, setWorkersEnabled] = useState(data.enabled);
  const [edit, setEdit] = useState(false);
  const form = useForm({
    resolver: rhfZodResolver(embeddingsSettingsFormSchema),
    mode: 'onChange',
    defaultValues: toSettingsFormValues(data),
  });
  const { handleSubmit, reset, formState } = form;
  const dirty = formState.isDirty;

  useEffect(() => {
    setWorkersEnabled(data.enabled);
    reset(toSettingsFormValues(data));
  }, [data, reset]);

  const onSubmit = useCallback(
    async (values: ReturnType<typeof toSettingsFormValues>) => {
      const result = await save({
        action: () =>
          patchEmbeddingsSettings(
            toSettingsPatch(values, data, workersEnabled)
          ),
        onSuccess: () => router.refresh(),
      });
      if (result.ok) {
        setEdit(false);
      }
    },
    [data, router, save, workersEnabled]
  );

  const cancelEdit = useCallback(() => {
    reset(toSettingsFormValues(data));
    setEdit(false);
  }, [data, reset]);

  useSaveShortcut(
    edit && dirty && !isSaving,
    useCallback(() => {
      void handleSubmit(onSubmit)();
    }, [handleSubmit, onSubmit])
  );

  useEffect(() => {
    if (!edit) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isCancelShortcut(event)) return;
      event.preventDefault();
      cancelEdit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cancelEdit, edit]);

  const handleWorkersToggle = () => {
    const nextEnabled = !workersEnabled;
    addAlert({
      title: nextEnabled ? 'Enable workers' : 'Disable workers',
      description: nextEnabled
        ? serving === false
          ? 'The embeddings workload is not serving. Workers will not process jobs until the module is deployed. Enable workers anyway?'
          : 'Enable generation workers and mutation subscriptions? This does not deploy or stop the embeddings workload.'
        : 'Disable generation workers and mutation subscriptions? The embeddings workload stays deployed.',
      cancelText: 'Cancel',
      actionText: 'Proceed',
      onDecision: cancel => {
        if (cancel) return;
        setWorkersEnabled(nextEnabled);
        void save({
          action: () =>
            patchEmbeddingsSettings(
              { enabled: nextEnabled },
              nextEnabled
                ? activeTogglePatchOptions(['embeddings'], true)
                : undefined
            ),
          isActivationSuccess: nextEnabled ? isWorkersPatchSuccess : undefined,
          onSuccess: () => router.refresh(),
          onError: () => setWorkersEnabled(data.enabled),
          onActivationFailure: () => setWorkersEnabled(data.enabled),
        });
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-3 rounded-lg border border-border/60 bg-card p-3">
        <ModuleToggle
          label="Workers"
          checked={workersEnabled}
          isSaving={isSaving}
          onCheckedChange={handleWorkersToggle}
        />
        <p className="max-w-2xl text-xs text-muted-foreground text-pretty">
          Workers process embedding jobs and subscribe to schema mutations. The
          toggle does not deploy or remove the embeddings service.
        </p>
        <p
          className={cn(
            'text-xs font-medium',
            serving === true
              ? 'text-status-healthy'
              : serving === false
                ? 'text-status-critical'
                : 'text-status-unknown'
          )}
        >
          {serving === true
            ? 'Workload is serving. Workers can run when enabled.'
            : serving === false
              ? 'Workload is not serving. Deploy the embeddings module before jobs can run.'
              : 'Workload serving state is unavailable.'}
        </p>
      </section>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit, () => undefined)}>
          <SettingsForm
            edit={edit}
            isSaving={isSaving}
            dirty={dirty}
            shortcutLabel={shortcutLabel}
            setEdit={setEdit}
            onCancel={cancelEdit}
          />
        </form>
      </Form>
    </div>
  );
}
