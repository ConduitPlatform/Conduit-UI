'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ConfigFormFields } from '@/components/embeddings/configs/config-form-fields';
import { DeleteConfigDialog } from '@/components/embeddings/configs/delete-config-dialog';
import { MaterialEditDialog } from '@/components/embeddings/configs/material-edit-dialog';
import { SaveConfigButton } from '@/components/embeddings/configs/save-config-button';
import {
  configFormSignature,
  embeddingConfigFormSchema,
  EmbeddingConfigFormValues,
  shouldResetConfigForm,
  toConfigFormValues,
} from '@/components/embeddings/configs/schema';
import {
  useSaveShortcut,
  useSaveShortcutHint,
} from '@/components/embeddings/configs/use-save-shortcut';
import {
  deleteEmbeddingConfig,
  upsertEmbeddingConfig,
} from '@/lib/api/embeddings';
import { toast } from '@/lib/hooks/use-toast';
import {
  diffMaterialEmbeddingConfig,
  isInPlaceDimensionChange,
  requiresIndexRecreation,
  toMaterialEmbeddingConfig,
} from '@/lib/models/embeddings/config-change';
import { EmbeddingConfig } from '@/lib/models/embeddings/config';
import { formatEmbeddingsApiError } from '@/lib/models/embeddings/errors';
import { EmbeddingSchemaFormChoice } from '@/lib/models/embeddings/source-fields';
import { ConfigProviderChoice } from '@/lib/models/embeddings/config-catalogue';
import { rhfZodResolver } from '@/lib/zod-form';

type ConfigEditFormProps = {
  config: EmbeddingConfig;
  schemas: EmbeddingSchemaFormChoice[];
  providers: ConfigProviderChoice[];
  modelBlocked: boolean;
  enableAllowed: boolean;
  enableBlockedReason?: string;
  enableBlockedHref?: string;
  enableBlockedAction?: string;
};

export function ConfigEditForm({
  config,
  schemas,
  providers,
  modelBlocked,
  enableAllowed,
  enableBlockedReason,
  enableBlockedHref,
  enableBlockedAction,
}: ConfigEditFormProps) {
  const router = useRouter();
  const shortcut = useSaveShortcutHint();
  const [applied, setApplied] = useState(config);
  const ignoredIncomingSignatureRef = useRef<string | null>(null);
  const [materialOpen, setMaterialOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<EmbeddingConfigFormValues | null>(null);

  const form = useForm<EmbeddingConfigFormValues>({
    resolver: rhfZodResolver(embeddingConfigFormSchema),
    mode: 'onChange',
    defaultValues: toConfigFormValues(config),
  });
  const { reset, watch } = form;
  const currentValues = watch();
  const appliedSignature = configFormSignature(toConfigFormValues(applied));
  const dirty = configFormSignature(currentValues) !== appliedSignature;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  const applyPersistedConfig = useCallback(
    (next: EmbeddingConfig) => {
      setApplied(next);
      reset(toConfigFormValues(next));
    },
    [reset]
  );

  useEffect(() => {
    const incomingSignature = configFormSignature(toConfigFormValues(config));
    const nextAppliedSignature = configFormSignature(
      toConfigFormValues(applied)
    );
    if (
      incomingSignature === nextAppliedSignature &&
      config._id === applied._id
    ) {
      ignoredIncomingSignatureRef.current = null;
      return;
    }
    if (
      !shouldResetConfigForm({
        incomingId: config._id,
        incomingSignature,
        appliedId: applied._id,
        appliedSignature: nextAppliedSignature,
        dirty: dirtyRef.current,
        ignoredIncomingSignature: ignoredIncomingSignatureRef.current,
      })
    ) {
      return;
    }
    ignoredIncomingSignatureRef.current = null;
    applyPersistedConfig(config);
  }, [applied, applyPersistedConfig, config]);

  const existing = toMaterialEmbeddingConfig(applied);

  const persist = useCallback(
    async (values: EmbeddingConfigFormValues) => {
      try {
        const result = await upsertEmbeddingConfig(values);
        toast({
          title: 'Config saved',
          description:
            result.warnings.length > 0 ? result.warnings.join(' ') : undefined,
        });
        setMaterialOpen(false);
        setPendingValues(null);
        ignoredIncomingSignatureRef.current = configFormSignature(
          toConfigFormValues(config)
        );
        applyPersistedConfig(result.config);
        if (result.config._id !== config._id) {
          router.push(`/embeddings/configs/${result.config._id}`);
          return;
        }
        router.refresh();
      } catch (error) {
        toast({
          title: 'Could not save config',
          description: formatEmbeddingsApiError(error),
          variant: 'destructive',
        });
      }
    },
    [applyPersistedConfig, config, router]
  );

  const submit = useCallback(
    (values: EmbeddingConfigFormValues) => {
      if (modelBlocked) return;
      const next = toMaterialEmbeddingConfig(values);
      if (isInPlaceDimensionChange(existing, next)) {
        form.setError('dimensions', {
          type: 'manual',
          message:
            'Changing dimensions on the same target field is not allowed. Choose a new target field first.',
        });
        return;
      }
      const changed = diffMaterialEmbeddingConfig(existing, next);
      if (changed.length > 0) {
        setPendingValues(values);
        setMaterialOpen(true);
        return;
      }
      void persist(values);
    },
    [existing, form, modelBlocked, persist]
  );

  const submitting = form.formState.isSubmitting;
  useSaveShortcut(
    dirty && !submitting && !materialOpen && !deleteOpen && !modelBlocked,
    useCallback(() => {
      void form.handleSubmit(submit)();
    }, [form, submit])
  );

  const pendingMaterial = pendingValues
    ? toMaterialEmbeddingConfig(pendingValues)
    : existing;
  const changed = diffMaterialEmbeddingConfig(existing, pendingMaterial);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
          <ConfigFormFields
            schemas={schemas}
            providers={providers}
            schemaLocked
            modelBlocked={modelBlocked}
            enableAllowed={enableAllowed}
            enableBlockedReason={enableBlockedReason}
            enableBlockedHref={enableBlockedHref}
            enableBlockedAction={enableBlockedAction}
          />
          <div className="flex flex-wrap gap-2">
            <SaveConfigButton
              dirty={dirty}
              submitting={submitting}
              blocked={modelBlocked}
              label="Save changes"
              shortcutLabel={shortcut.label}
              shortcutAria={shortcut.aria}
            />
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </div>
        </form>
      </Form>
      <MaterialEditDialog
        open={materialOpen}
        onOpenChange={setMaterialOpen}
        recreatesIndex={requiresIndexRecreation(changed)}
        createsNewConfig={changed.includes('targetField')}
        pending={submitting}
        onConfirm={() => {
          if (pendingValues) void persist(pendingValues);
        }}
      />
      <DeleteConfigDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        pending={deleting}
        onConfirm={() => {
          setDeleting(true);
          deleteEmbeddingConfig(config._id)
            .then(() => {
              toast({ title: 'Config deleted' });
              router.push('/embeddings/configs');
            })
            .catch(error => {
              setDeleting(false);
              toast({
                title: 'Could not delete config',
                description: formatEmbeddingsApiError(error),
                variant: 'destructive',
              });
            });
        }}
      />
    </>
  );
}
