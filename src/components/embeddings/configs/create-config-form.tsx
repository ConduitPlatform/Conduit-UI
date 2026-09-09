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
  useSaveShortcutHint,
} from '@/components/embeddings/configs/use-save-shortcut';
import { upsertEmbeddingConfig } from '@/lib/api/embeddings';
import { toast } from '@/lib/hooks/use-toast';
import { formatEmbeddingsApiError } from '@/lib/models/embeddings/errors';
import { EmbeddingSchemaFormChoice } from '@/lib/models/embeddings/source-fields';
import { ConfigProviderChoice } from '@/lib/models/embeddings/config-catalogue';
import { rhfZodResolver } from '@/lib/zod-form';

type CreateConfigFormProps = {
  schemas: EmbeddingSchemaFormChoice[];
  providers: ConfigProviderChoice[];
  defaultProvider: string;
  defaultModel: string;
  defaultDimensions: number;
};

export function CreateConfigForm({
  schemas,
  providers,
  defaultProvider,
  defaultModel,
  defaultDimensions,
}: CreateConfigFormProps) {
  const router = useRouter();
  const shortcut = useSaveShortcutHint();
  const form = useForm<EmbeddingConfigFormValues>({
    resolver: rhfZodResolver(embeddingConfigFormSchema),
    mode: 'onChange',
    defaultValues: defaultConfigFormValues({
      provider: defaultProvider,
      model: defaultModel,
      dimensions: defaultDimensions,
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
          providers={providers}
          enableAllowed={false}
          enableBlockedReason="New configs start disabled until the matching index is queryable."
        />
        <div className="flex flex-wrap gap-2">
          <SaveConfigButton
            dirty={dirty}
            submitting={submitting}
            label="Create config"
            shortcutLabel={shortcut.label}
            shortcutAria={shortcut.aria}
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
