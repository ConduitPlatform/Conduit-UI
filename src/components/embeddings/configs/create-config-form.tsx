'use client';

import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ConfigFormFields } from '@/components/embeddings/configs/config-form-fields';
import { SaveConfigButton } from '@/components/embeddings/configs/save-config-button';
import {
  defaultConfigFormValues,
  embeddingConfigFormSchema,
  EmbeddingConfigFormValues,
} from '@/components/embeddings/configs/schema';
import {
  useSaveShortcut,
  useSaveShortcutLabel,
} from '@/components/embeddings/configs/use-save-shortcut';
import { upsertEmbeddingConfig } from '@/lib/api/embeddings';
import { toast } from '@/lib/hooks/use-toast';
import { formatEmbeddingsApiError } from '@/lib/models/embeddings/errors';
import { EmbeddingSchemaChoice } from '@/lib/models/embeddings/source-fields';
import { rhfZodResolver } from '@/lib/zod-form';

type CreateConfigFormProps = {
  schemas: EmbeddingSchemaChoice[];
  defaultProvider: string;
  defaultModel: string;
};

export function CreateConfigForm({
  schemas,
  defaultProvider,
  defaultModel,
}: CreateConfigFormProps) {
  const router = useRouter();
  const shortcutLabel = useSaveShortcutLabel();
  const form = useForm<EmbeddingConfigFormValues>({
    resolver: rhfZodResolver(embeddingConfigFormSchema),
    mode: 'onChange',
    defaultValues: defaultConfigFormValues({
      provider: defaultProvider,
      model: defaultModel,
    }),
  });

  const submit = useCallback(
    async (values: EmbeddingConfigFormValues) => {
      try {
        const result = await upsertEmbeddingConfig({
          ...values,
          enabled: false,
        });
        toast({
          title: 'Config created',
          description:
            result.warnings.length > 0
              ? result.warnings.join(' ')
              : 'The config is disabled until the matching index is queryable.',
        });
        router.push(`/embeddings/configs/${result.config._id}`);
      } catch (error) {
        toast({
          title: 'Could not create config',
          description: formatEmbeddingsApiError(error),
          variant: 'destructive',
        });
      }
    },
    [router]
  );

  const dirty = form.formState.isDirty;
  const submitting = form.formState.isSubmitting;
  useSaveShortcut(
    dirty && !submitting,
    useCallback(() => {
      void form.handleSubmit(submit)();
    }, [form, submit])
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="space-y-6 max-w-3xl"
      >
        <ConfigFormFields
          schemas={schemas}
          enableAllowed={false}
          enableBlockedReason="New configs start disabled until the matching index is queryable."
        />
        <div className="flex flex-wrap gap-2">
          <SaveConfigButton
            dirty={dirty}
            submitting={submitting}
            label="Create config"
            shortcutLabel={shortcutLabel}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/embeddings/configs')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
