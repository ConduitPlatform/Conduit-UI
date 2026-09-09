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
import { PasswordInput } from '@/components/ui/password-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdvancedSettings } from '@/components/embeddings/settings/advanced-settings';
import { HostsField } from '@/components/embeddings/settings/hosts-field';
import { SettingsFormActions } from '@/components/settings/SettingsFormActions';
import { OPENAI_COMPATIBLE_PROVIDER } from '@/lib/models/embeddings/settings';
import { EmbeddingsSettingsFormValues } from '@/lib/models/embeddings/settings-form';

type SettingsFormProps = {
  edit: boolean;
  isSaving: boolean;
  dirty: boolean;
  shortcutLabel: string;
  shortcutAria?: string;
  setEdit: (edit: boolean) => void;
  onCancel: () => void;
};

export function SettingsForm({
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
            Endpoint, API key, hosts, and default model.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="defaultProvider"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel>Default provider</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!edit}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={OPENAI_COMPATIBLE_PROVIDER}>
                      OpenAI-compatible
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <InputField
            fieldName="model"
            label="Default model"
            placeholder="text-embedding-3-small"
            disabled={!edit}
            autoComplete="off"
            description="Used when a config does not set its own model."
          />
          <div className="md:col-span-2">
            <InputField
              fieldName="endpoint"
              label="Endpoint"
              placeholder="https://api.openai.com/v1/embeddings"
              disabled={!edit}
              autoComplete="off"
              inputMode="url"
              description="HTTPS OpenAI-compatible embeddings URL with a public DNS hostname. Credentials in the URL are rejected."
            />
          </div>
          <ApiKeyField disabled={!edit} />
          <div className="md:col-span-2">
            <HostsField
              name="allowedHosts"
              label="Allowed hosts"
              disabled={!edit}
              description="Public DNS hostnames this provider may call. Include the endpoint hostname. Private, loopback, and metadata hosts are rejected."
            />
          </div>
        </div>
      </section>
      <AdvancedSettings disabled={!edit} />
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
              value={typeof field.value === 'string' ? field.value : ''}
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
