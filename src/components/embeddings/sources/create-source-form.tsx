'use client';

import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/form-inputs/InputField';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { SaveConfigButton } from '@/components/embeddings/configs/save-config-button';
import {
  useSaveShortcut,
  useSaveShortcutHint,
} from '@/components/embeddings/configs/use-save-shortcut';
import { createEmbeddingSource } from '@/lib/api/embeddings';
import { toast } from '@/lib/hooks/use-toast';
import { formatEmbeddingsApiError } from '@/lib/models/embeddings/errors';
import {
  sourceKindLabel,
  storageLimitExplanations,
  type EmbeddingSourceKind,
  type StorageExtractionLimits,
} from '@/lib/models/embeddings/source';
import { ConfigProviderChoice } from '@/lib/models/embeddings/config-catalogue';
import { rhfZodResolver } from '@/lib/zod-form';
import {
  defaultSourceFormValues,
  embeddingSourceFormSchema,
  EmbeddingSourceFormValues,
  sourceFormToCreateInput,
} from './schema';
import { SourceProfileFields } from './source-profile-fields';
import { ScopePicker, type TeamOption } from './scope-picker';
import {
  StorageSelectorFields,
  type ContainerOption,
} from './storage-selector-fields';
import { MimeAllowlistField } from './mime-allowlist';
import { MetadataAllowlistField } from './metadata-allowlist-field';

type CreateSourceFormProps = {
  kind: EmbeddingSourceKind;
  providers: ConfigProviderChoice[];
  defaultProvider: string;
  defaultModel: string;
  defaultDimensions: number;
  teams: TeamOption[];
  containers: ContainerOption[];
  limits: StorageExtractionLimits;
};

export function CreateSourceForm({
  kind,
  providers,
  defaultProvider,
  defaultModel,
  defaultDimensions,
  teams,
  containers,
  limits,
}: CreateSourceFormProps) {
  const router = useRouter();
  const shortcut = useSaveShortcutHint();
  const form = useForm<EmbeddingSourceFormValues>({
    resolver: rhfZodResolver(embeddingSourceFormSchema),
    mode: 'onChange',
    defaultValues: defaultSourceFormValues({
      kind,
      provider: defaultProvider,
      model: defaultModel,
      dimensions: defaultDimensions,
    }),
  });

  const submit = useCallback(
    async (values: EmbeddingSourceFormValues) => {
      try {
        const result = await createEmbeddingSource(
          sourceFormToCreateInput({ ...values, kind })
        );
        toast({
          title: `${sourceKindLabel(kind)} source created`,
          description:
            result.warnings.length > 0
              ? result.warnings.join(' ')
              : 'The source stays pending until its chunk index is queryable.',
        });
        router.push(`/embeddings/sources/${result.source._id}`);
      } catch (error) {
        toast({
          title: 'Could not create source',
          description: formatEmbeddingsApiError(error),
          variant: 'destructive',
        });
      }
    },
    [kind, router]
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
        <ScopePicker teams={teams} />
        <SourceProfileFields providers={providers} />
        {kind === 'conduit-storage' ? (
          <>
            <StorageSelectorFields containers={containers} />
            <MimeAllowlistField />
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" className="min-h-8 px-0">
                  Extraction limits
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {storageLimitExplanations(limits).map(item => (
                  <p key={item.label} className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {item.label}.
                    </span>{' '}
                    {item.detail}
                  </p>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            After save, ingest trusted text chunks or precomputed vectors
            through Admin API or gRPC. There is no browser upload.
          </p>
        )}
        <MetadataAllowlistField />
        <div className="flex flex-wrap gap-2">
          <SaveConfigButton
            dirty={dirty}
            submitting={submitting}
            blocked={!form.formState.isValid}
            label="Create source"
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
