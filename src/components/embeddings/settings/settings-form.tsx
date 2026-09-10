'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { InputField } from '@/components/ui/form-inputs/InputField';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { AdvancedSettings } from '@/components/embeddings/settings/advanced-settings';
import { ModelCatalogueField } from '@/components/embeddings/settings/model-catalogue-field';
import { SettingsFormActions } from '@/components/settings/SettingsFormActions';
import { EmbeddingsSettingsFormValues } from '@/lib/models/embeddings/settings-form';
import type { EmbeddingsSettings } from '@/lib/models/embeddings/settings';

type SettingsFormProps = {
  settings: EmbeddingsSettings;
  edit: boolean;
  isSaving: boolean;
  dirty: boolean;
  shortcutLabel: string;
  shortcutAria?: string;
  setEdit: (edit: boolean) => void;
  onCancel: () => void;
};

export function SettingsForm({
  settings,
  edit,
  isSaving,
  dirty,
  shortcutLabel,
  shortcutAria,
  setEdit,
  onCancel,
}: SettingsFormProps) {
  const { control } = useFormContext<EmbeddingsSettingsFormValues>();

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-4 rounded-lg border border-border/60 bg-card p-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-balance">
            OpenAI-compatible provider
          </h2>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            HTTPS endpoint, API key, and the model catalogue.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="defaultProvider"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel>Provider</FormLabel>
                <FormControl>
                  <Input
                    value={field.value}
                    name={field.name}
                    ref={field.ref}
                    readOnly
                    disabled
                    autoComplete="off"
                    aria-label="Provider"
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Fixed to openai-compatible.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:col-span-2">
            <InputField
              fieldName="endpoint"
              label="Endpoint"
              placeholder="https://api.openai.com/v1/embeddings"
              disabled={!edit}
              autoComplete="off"
              inputMode="url"
              description="HTTPS OpenAI-compatible embeddings URL. Credentials in the URL are rejected."
            />
          </div>
          <ApiKeyField disabled={!edit} />
          <ModelCatalogueField disabled={!edit} />
        </div>
      </section>
      <AdvancedSettings disabled={!edit} settings={settings} />
      <SettingsFormActions
        edit={edit}
        isSaving={isSaving}
        dirty={dirty}
        shortcutLabel={shortcutLabel}
        shortcutAria={shortcutAria}
        submitLabel="Save"
        onEdit={() => setEdit(true)}
        onCancel={onCancel}
      />
    </div>
  );
}

function ApiKeyField({ disabled }: { disabled: boolean }) {
  const { control } = useFormContext<EmbeddingsSettingsFormValues>();
  const configured = useWatch({ control, name: 'apiKeyConfigured' });

  return (
    <FormField
      control={control}
      name="apiKey"
      render={({ field }) => (
        <FormItem className="space-y-1.5 md:col-span-2">
          <FormLabel>API key</FormLabel>
          <FormControl>
            <PasswordInput
              autoComplete="new-password"
              disabled={disabled}
              placeholder={
                configured ? 'Enter a replacement key' : 'Provider API key'
              }
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
              ref={field.ref}
            />
          </FormControl>
          <FormDescription className="text-xs">
            {configured
              ? 'A key is already stored. Leave blank to keep it, or enter a replacement.'
              : 'Required to call the provider. The stored value is never shown.'}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
