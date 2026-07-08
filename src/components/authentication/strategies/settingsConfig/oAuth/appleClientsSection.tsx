'use client';

import type { ReactNode } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { InputField } from '@/components/ui/form-inputs/InputField';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { SecretTextarea } from '@/components/ui/secret-textarea';
import { ChevronDown, PlusIcon, Trash2Icon } from 'lucide-react';

type CredentialFields = {
  clientId?: string;
  teamId?: string;
  keyId?: string;
  privateKey?: string;
};

function credentialLabel(fields: CredentialFields) {
  const filled = [
    fields.clientId,
    fields.teamId,
    fields.keyId,
    fields.privateKey,
  ]
    .map(value => value?.trim())
    .filter(Boolean).length;
  if (filled === 0) return 'Not configured';
  if (filled === 4) return 'Credentials complete';
  return 'Incomplete';
}

function CredentialBadge({ fields }: { fields: CredentialFields }) {
  const label = credentialLabel(fields);
  return (
    <Badge
      variant={label === 'Credentials complete' ? 'secondary' : 'outline'}
      className={
        label === 'Not configured'
          ? 'shrink-0 font-normal text-muted-foreground'
          : 'shrink-0 font-normal'
      }
    >
      {label}
    </Badge>
  );
}

function fieldPath(prefix: string, name: string) {
  return prefix ? `${prefix}${name}` : name;
}

function AppleClientFields({
  prefix = '',
  showIdentity,
}: {
  prefix?: string;
  showIdentity?: boolean;
}) {
  const form = useFormContext();

  return (
    <div className="space-y-4 p-4">
      {showIdentity && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InputField
            fieldName={fieldPath(prefix, 'id')}
            label="Client ID (oauthClientId)"
            description="Unique identifier passed during OAuth init"
          />
          <InputField
            fieldName={fieldPath(prefix, 'name')}
            label="Display name"
            description="Admin label for this app"
          />
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InputField fieldName={fieldPath(prefix, 'teamId')} label="Team ID" />
        <InputField
          fieldName={fieldPath(prefix, 'clientId')}
          label="Client ID"
        />
      </div>
      <InputField
        fieldName={fieldPath(prefix, 'keyId')}
        label="Private key ID"
      />
      <FormField
        control={form.control}
        name={fieldPath(prefix, 'privateKey')}
        render={({ field }) => (
          <FormItem className="w-full space-y-1.5">
            <FormLabel className="flex gap-2 pl-1 text-base font-medium text-text-body">
              Private Key
            </FormLabel>
            <FormControl>
              <SecretTextarea placeholder="" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <InputField
        fieldName={fieldPath(prefix, 'redirect_uri')}
        label="Redirect URI"
        description={
          showIdentity ? 'Optional override for this client' : undefined
        }
      />
    </div>
  );
}

function AppleClientCollapsible({
  title,
  subtitle,
  fields,
  onRemove,
  children,
}: {
  title: string;
  subtitle?: string;
  fields: CredentialFields;
  onRemove?: () => void;
  children: ReactNode;
}) {
  return (
    <Collapsible className="mb-0 overflow-hidden rounded-md border">
      <div className="flex items-center gap-2 bg-muted/30 p-3">
        <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform ui-open:rotate-180" />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="truncate text-sm font-medium">{title}</p>
            {subtitle ? (
              <p className="truncate font-mono text-xs text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
        </CollapsibleTrigger>
        <CredentialBadge fields={fields} />
        {onRemove ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            aria-label={`Remove ${title}`}
            onClick={onRemove}
          >
            <Trash2Icon className="mr-1.5 h-4 w-4" />
            Remove
          </Button>
        ) : null}
      </div>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}

export function AppleDefaultClientSection() {
  const form = useFormContext();
  const fields = {
    clientId: form.watch('clientId'),
    teamId: form.watch('teamId'),
    keyId: form.watch('keyId'),
    privateKey: form.watch('privateKey'),
  };

  return (
    <section className="space-y-2">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Default client</h3>
        <p className="text-sm text-muted-foreground">
          Used when OAuth init does not pass{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            oauthClientId
          </code>
          .
        </p>
      </div>
      <AppleClientCollapsible
        title="Credentials"
        subtitle="Fallback when oauthClientId is omitted"
        fields={fields}
      >
        <AppleClientFields />
      </AppleClientCollapsible>
    </section>
  );
}

const emptyAppleClient = {
  id: '',
  name: '',
  clientId: '',
  teamId: '',
  keyId: '',
  privateKey: '',
  redirect_uri: '',
};

export function AppleAdditionalClientsSection() {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'clients',
  });

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">App clients</h3>
        <p className="text-sm text-muted-foreground">
          Additional credential sets selected at login via{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            oauthClientId
          </code>
          .
        </p>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-md border border-dashed bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          No additional app clients configured.
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const prefix = `clients.${index}.`;
            const name = form.watch(`${prefix}name`) ?? '';
            const oauthClientId = form.watch(`${prefix}id`) ?? '';
            const displayName = name.trim() || `Client ${index + 1}`;

            return (
              <AppleClientCollapsible
                key={field.id}
                title={displayName}
                subtitle={
                  oauthClientId.trim()
                    ? `oauthClientId: ${oauthClientId}`
                    : 'oauthClientId not set'
                }
                fields={{
                  clientId: form.watch(`${prefix}clientId`),
                  teamId: form.watch(`${prefix}teamId`),
                  keyId: form.watch(`${prefix}keyId`),
                  privateKey: form.watch(`${prefix}privateKey`),
                }}
                onRemove={() => remove(index)}
              >
                <AppleClientFields prefix={prefix} showIdentity />
              </AppleClientCollapsible>
            );
          })}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto"
        onClick={() => append({ ...emptyAppleClient })}
      >
        <PlusIcon className="mr-1.5 h-4 w-4" />
        Add app client
      </Button>
    </section>
  );
}
