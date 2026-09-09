'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, CircleHelp } from 'lucide-react';
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
import { useSettingsSave } from '@/lib/hooks/use-settings-save';
import { patchEmbeddingsSettings } from '@/lib/api/embeddings';
import type { EmbeddingsSettings as EmbeddingsModuleSettings } from '@/lib/models/embeddings/settings';
import {
  EmbeddingsSettingsFormValues,
  toSettingsFormValues,
  toSettingsPatch,
} from '@/lib/models/embeddings/settings-form';
import { rhfZodResolver } from '@/lib/zod-form';
import { cn } from '@/lib/utils';

type EmbeddingsSettingsProps = {
  data: EmbeddingsModuleSettings;
  serving?: boolean;
};

function servingPresentation(serving?: boolean) {
  switch (serving) {
    case true:
      return {
        Icon: CheckCircle2,
        className: 'text-status-healthy',
        text: 'Workload is serving. Workers can run when enabled.',
      };
    case false:
      return {
        Icon: AlertTriangle,
        className: 'text-status-critical',
        text: 'Workload is not serving. Deploy the embeddings module before jobs can run.',
      };
    default:
      return {
        Icon: CircleHelp,
        className: 'text-status-unknown',
        text: 'Workload serving state is unavailable.',
      };
  }
}

function workersToggleDescription(nextEnabled: boolean, serving?: boolean) {
  if (!nextEnabled) {
    return 'Disable generation workers and mutation subscriptions? The embeddings workload stays deployed.';
  }
  if (serving === false) {
    return 'The embeddings workload is not serving. Workers will not process jobs until the module is deployed. Enable workers anyway?';
  }
  return 'Enable generation workers and mutation subscriptions? This does not deploy or stop the embeddings workload.';
}

function isWorkersPatchSuccess(
  result: { config: EmbeddingsModuleSettings },
  expectedEnabled: boolean
) {
  return result.config.enabled === expectedEnabled;
}

export function EmbeddingsSettings({ data, serving }: EmbeddingsSettingsProps) {
  const router = useRouter();
  const { addAlert } = useAlerts();
  const { save, isSaving } = useSettingsSave('Embeddings');
  const shortcutLabel = useSaveShortcutLabel();
  const [workersEnabled, setWorkersEnabled] = useState(data.enabled);
  const [edit, setEdit] = useState(false);
  const form = useForm<EmbeddingsSettingsFormValues>({
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
    async (values: EmbeddingsSettingsFormValues) => {
      const result = await save({
        action: () =>
          patchEmbeddingsSettings(
            toSettingsPatch(values, data, workersEnabled)
          ),
        onSuccess: result => {
          setWorkersEnabled(result.config.enabled);
          router.refresh();
        },
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
      description: workersToggleDescription(nextEnabled, serving),
      cancelText: 'Cancel',
      actionText: 'Proceed',
      onDecision: cancel => {
        if (cancel) return;
        setWorkersEnabled(nextEnabled);
        void save({
          action: () => patchEmbeddingsSettings({ enabled: nextEnabled }),
          isActivationSuccess: result =>
            isWorkersPatchSuccess(result, nextEnabled),
          onSuccess: result => {
            setWorkersEnabled(result.config.enabled);
            router.refresh();
          },
          onError: () => setWorkersEnabled(data.enabled),
          onActivationFailure: result => {
            setWorkersEnabled(result.config.enabled);
          },
        });
      },
    });
  };

  const servingStatus = servingPresentation(serving);
  const ServingIcon = servingStatus.Icon;

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
            'flex items-center gap-2 text-xs font-medium',
            servingStatus.className
          )}
        >
          <ServingIcon aria-hidden className="size-4 shrink-0" />
          {servingStatus.text}
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
