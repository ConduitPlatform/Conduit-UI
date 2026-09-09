'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ConfigFormFields } from '@/components/embeddings/configs/config-form-fields';
import { DeleteConfigDialog } from '@/components/embeddings/configs/delete-config-dialog';
import { MaterialEditDialog } from '@/components/embeddings/configs/material-edit-dialog';
import { SaveConfigButton } from '@/components/embeddings/configs/save-config-button';
import {
  embeddingConfigFormSchema,
  EmbeddingConfigFormValues,
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
  const existing = toMaterialEmbeddingConfig(config);
  const [materialOpen, setMaterialOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<EmbeddingConfigFormValues | null>(null);

  const form = useForm<EmbeddingConfigFormValues>({
    resolver: rhfZodResolver(embeddingConfigFormSchema),
    mode: 'onChange',
    defaultValues: {
      schemaName: config.schemaName,
      sourceFields: config.sourceFields,
      targetField: config.targetField,
      provider: config.provider,
      model: config.model,
      dimensions: config.dimensions,
      similarity: config.similarity,
      enabled: config.enabled,
    },
  });

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
    [config._id, router]
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

  const dirty = form.formState.isDirty;
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
