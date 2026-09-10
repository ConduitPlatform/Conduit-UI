'use client';

import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/form-inputs/InputField';
import { SaveConfigButton } from '@/components/embeddings/configs/save-config-button';
import {
  useSaveShortcut,
  useSaveShortcutHint,
} from '@/components/embeddings/configs/use-save-shortcut';
import { updateEmbeddingSource } from '@/lib/api/embeddings';
import { toast } from '@/lib/hooks/use-toast';
import { formatEmbeddingsApiError } from '@/lib/models/embeddings/errors';
import type { EmbeddingSource } from '@/lib/models/embeddings/source';
import type { ConfigProviderChoice } from '@/lib/models/embeddings/config-catalogue';
import { rhfZodResolver } from '@/lib/zod-form';
import {
  embeddingSourceFormSchema,
  EmbeddingSourceFormValues,
  sourceFormToInput,
  toSourceFormValues,
} from './schema';
import { SourceProfileFields } from './source-profile-fields';
import { ScopePicker } from './scope-picker';
import { StorageSelectorFields } from './storage-selector-fields';
import type {
  ContainerOption,
  TeamOption,
} from '@/lib/api/embeddings/source-options';
import { MimeAllowlistField } from './mime-allowlist';
import { MetadataAllowlistField } from './metadata-allowlist-field';

type SourceEditFormProps = {
  source: EmbeddingSource;
  providers: ConfigProviderChoice[];
  modelBlocked: boolean;
  teams: TeamOption[];
  containers: ContainerOption[];
  teamsError?: string;
  containersError?: string;
  teamsTruncated?: boolean;
  containersTruncated?: boolean;
  teamsTotal?: number;
  containersTotal?: number;
};

export function SourceEditForm({
  source,
  providers,
  modelBlocked,
  teams,
  containers,
  teamsError,
  containersError,
  teamsTruncated,
  containersTruncated,
  teamsTotal,
  containersTotal,
}: SourceEditFormProps) {
  const router = useRouter();
  const shortcut = useSaveShortcutHint();
  const form = useForm<EmbeddingSourceFormValues>({
    resolver: rhfZodResolver(embeddingSourceFormSchema),
    mode: 'onChange',
    defaultValues: toSourceFormValues(source),
  });

  const submit = useCallback(
    async (values: EmbeddingSourceFormValues) => {
      const input = sourceFormToInput(values);
      try {
        const result = await updateEmbeddingSource(source._id, {
          label: input.label ?? '',
          selectors: input.selectors,
          metadataAllowlist: input.metadataAllowlist,
        });
        toast({
          title: 'Source updated',
          description:
            result.warnings.length > 0
              ? result.warnings.join(' ')
              : 'Mutable fields were saved. Profile and scope stay unchanged.',
        });
        router.refresh();
      } catch (error) {
        toast({
          title: 'Could not update source',
          description: formatEmbeddingsApiError(error),
          variant: 'destructive',
        });
      }
    },
    [router, source._id]
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
        className="max-w-3xl space-y-6"
      >
        <InputField fieldName="label" label="Label" placeholder="Invoices" />
        <ScopePicker
          teams={teams}
          disabled
          error={teamsError}
          truncated={teamsTruncated}
          total={teamsTotal}
        />
        <SourceProfileFields
          providers={providers}
          locked
          modelBlocked={modelBlocked}
        />
        {source.kind === 'conduit-storage' ? (
          <>
            <StorageSelectorFields
              containers={containers}
              error={containersError}
              truncated={containersTruncated}
              total={containersTotal}
            />
            <MimeAllowlistField />
          </>
        ) : null}
        <MetadataAllowlistField />
        <div className="flex flex-wrap gap-2">
          <SaveConfigButton
            dirty={dirty}
            submitting={submitting}
            blocked={!form.formState.isValid}
            label="Save source"
            shortcutLabel={shortcut.label}
            shortcutAria={shortcut.aria}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/embeddings/configs')}
          >
            Back to configs
          </Button>
        </div>
      </form>
    </Form>
  );
}
