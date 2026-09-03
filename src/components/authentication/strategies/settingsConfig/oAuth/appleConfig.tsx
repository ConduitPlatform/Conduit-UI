'use client';
import { z } from 'zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { rhfZodResolver } from '@/lib/zod-form';
import { oauthDefaultConfig } from '@/components/authentication/strategies/settingsConfig/oAuth/oauthDefaultConfig';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import { InputField } from '@/components/ui/form-inputs/InputField';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StrategyFormProps } from '@/components/authentication/strategies/interface/StrategyFormProps.interface';
import React from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { SecretTextarea } from '@/components/ui/secret-textarea';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';

type CredentialFields = {
  clientId?: string;
  teamId?: string;
  keyId?: string;
  privateKey?: string;
};

function defaultCredentialLabel(fields: CredentialFields): string {
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

function extraCredentialLabel(fields: CredentialFields): string {
  const filled = [fields.teamId, fields.keyId, fields.privateKey]
    .map(value => value?.trim())
    .filter(Boolean).length;
  if (filled === 0) return 'Reuses default';
  if (filled === 3) return 'Second team';
  return 'Incomplete';
}

function CredentialBadge({
  fields,
  isExtra = false,
}: {
  fields: CredentialFields;
  isExtra?: boolean;
}) {
  const label = isExtra
    ? extraCredentialLabel(fields)
    : defaultCredentialLabel(fields);
  const isComplete = isExtra
    ? label === 'Second team' || label === 'Reuses default'
    : label === 'Credentials complete';
  return (
    <Badge
      variant={isComplete ? 'secondary' : 'outline'}
      className={
        label === 'Not configured' || label === 'Reuses default'
          ? 'shrink-0 font-normal text-muted-foreground'
          : 'shrink-0 font-normal'
      }
    >
      {label}
    </Badge>
  );
}

const extraClientSchema = z
  .object({
    id: z.string().trim().min(1, 'Nickname is required'),
    clientId: z.string().trim().min(1, 'Apple app ID is required'),
    name: z.string().optional(),
    redirect_uri: z.string().optional(),
    privateKey: z.string().optional(),
    teamId: z.string().optional(),
    keyId: z.string().optional(),
  })
  .refine(
    data => {
      const hasPrivateKey =
        data.privateKey && data.privateKey.trim().length > 0;
      const hasTeamId = data.teamId && data.teamId.trim().length > 0;
      const hasKeyId = data.keyId && data.keyId.trim().length > 0;

      const credCount = [hasPrivateKey, hasTeamId, hasKeyId].filter(
        Boolean
      ).length;

      return credCount === 0 || credCount === 3;
    },
    {
      message:
        'Either leave all three empty to reuse the default key, or provide all three (private key, team ID, and key ID) for a second Apple team',
      path: ['privateKey'],
    }
  );

type authStrategyFormType = z.infer<typeof authStrategySchema>;
const authStrategySchema = oauthDefaultConfig
  .merge(
    z.object({
      privateKey: z.string().default(''),
      teamId: z.string().default(''),
      keyId: z.string().default(''),
      clients: z.array(extraClientSchema).default([]),
    })
  )
  .refine(
    data => {
      if (data.enabled) {
        if (!data.clientId || data.clientId.trim().length === 0) {
          return false;
        }
        if (!data.privateKey || data.privateKey.trim().length === 0) {
          return false;
        }
        if (!data.teamId || data.teamId.trim().length === 0) {
          return false;
        }
        if (!data.keyId || data.keyId.trim().length === 0) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        'When enabled, default client ID, private key, team ID, and key ID are all required',
      path: ['enabled'],
    }
  )
  .superRefine((data, ctx) => {
    const ids = data.clients.map((c, idx) => ({
      id: c.id.trim().toLowerCase(),
      index: idx,
    }));
    const seen = new Map<string, number>();

    for (const { id, index } of ids) {
      if (seen.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'This nickname is already used',
          path: ['clients', index, 'id'],
        });
        const firstIndex = seen.get(id)!;
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'This nickname is already used',
          path: ['clients', firstIndex, 'id'],
        });
      } else {
        seen.set(id, index);
      }
    }
  });

export const AppleConfigForm: React.FC<
  StrategyFormProps<authStrategyFormType>
> = ({ data, onSubmit, onCancel }) => {
  const form = useForm<authStrategyFormType>({
    resolver: rhfZodResolver(authStrategySchema),
    defaultValues: data
      ? { ...data, clients: data.clients || [] }
      : { clients: [] },
  });
  const { isSubmitting, errors } = form.formState;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'clients',
  });

  const [defaultOpen, setDefaultOpen] = React.useState(false);
  const [openClients, setOpenClients] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const hasDefaultErrors =
        errors.enabled ||
        errors.clientId ||
        errors.teamId ||
        errors.keyId ||
        errors.privateKey ||
        errors.redirect_uri;

      if (hasDefaultErrors) {
        setDefaultOpen(true);
      }

      if (errors.clients && Array.isArray(errors.clients)) {
        const newOpenClients = new Set<number>();
        errors.clients.forEach((clientError, index) => {
          if (clientError) {
            newOpenClients.add(index);
          }
        });
        setOpenClients(newOpenClients);
      }
    }
  }, [errors]);

  const handleFormSubmit = (formData: authStrategyFormType) => {
    const normalizeWhitespace = (value: string | undefined): string => {
      if (!value || value.trim().length === 0) {
        return '';
      }
      return value;
    };

    const processedData = {
      ...formData,
      clients: formData.clients.map(client => ({
        ...client,
        id: client.id.trim(),
        clientId: client.clientId.trim(),
        redirect_uri: normalizeWhitespace(client.redirect_uri),
        privateKey: normalizeWhitespace(client.privateKey),
        teamId: normalizeWhitespace(client.teamId),
        keyId: normalizeWhitespace(client.keyId),
      })),
    };
    onSubmit(processedData);
  };

  const defaultFields: CredentialFields = {
    clientId: form.watch('clientId'),
    teamId: form.watch('teamId'),
    keyId: form.watch('keyId'),
    privateKey: form.watch('privateKey'),
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-x-1">
            <SwitchField fieldName="enabled" label="Enabled" />
            <SwitchField fieldName="accountLinking" label="Account Linking" />
          </div>

          <section className="space-y-2">
            <div className="space-y-1">
              <h3 className="text-base font-semibold">Default client</h3>
              <p className="text-sm text-muted-foreground">
                Primary Apple credentials for authentication.
              </p>
            </div>
            <Collapsible
              open={defaultOpen}
              onOpenChange={setDefaultOpen}
              className="mb-0 overflow-hidden rounded-md border"
            >
              <div className="flex items-center gap-2 bg-muted/30 p-3">
                <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform ui-open:rotate-180" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">Credentials</p>
                  </div>
                </CollapsibleTrigger>
                <CredentialBadge fields={defaultFields} isExtra={false} />
              </div>
              <CollapsibleContent>
                <div className="space-y-4 p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InputField fieldName="teamId" label="Team ID" />
                    <InputField fieldName="clientId" label="Client ID" />
                  </div>
                  <InputField fieldName="keyId" label="Private key ID" />
                  <FormField
                    control={form.control}
                    name="privateKey"
                    render={({ field }) => (
                      <FormItem className="w-full space-y-1.5">
                        <FormLabel className="flex gap-2 pl-1 text-base font-medium text-text-body">
                          Private Key
                        </FormLabel>
                        <FormControl>
                          <SecretTextarea placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <InputField fieldName="redirect_uri" label="Redirect URI" />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </section>

          <section className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-base font-semibold">Extra clients</h3>
              <p className="text-sm text-muted-foreground">
                Additional credential sets for multi-app support.
              </p>
            </div>

            {fields.length === 0 ? (
              <div className="rounded-md border border-dashed bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                No extra clients configured.
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => {
                  const nickname = (form.watch(`clients.${index}.id` as any) ??
                    '') as string;
                  const appleAppId = (form.watch(
                    `clients.${index}.clientId` as any
                  ) ?? '') as string;
                  const displayName = nickname.trim() || `Client ${index + 1}`;

                  const extraFields: CredentialFields = {
                    clientId: (form.watch(`clients.${index}.clientId` as any) ??
                      '') as string,
                    teamId: (form.watch(`clients.${index}.teamId` as any) ??
                      '') as string,
                    keyId: (form.watch(`clients.${index}.keyId` as any) ??
                      '') as string,
                    privateKey: (form.watch(
                      `clients.${index}.privateKey` as any
                    ) ?? '') as string,
                  };

                  const isOpen = openClients.has(index);
                  const toggleOpen = (open: boolean) => {
                    const newOpenClients = new Set(openClients);
                    if (open) {
                      newOpenClients.add(index);
                    } else {
                      newOpenClients.delete(index);
                    }
                    setOpenClients(newOpenClients);
                  };

                  return (
                    <Collapsible
                      key={field.id}
                      open={isOpen}
                      onOpenChange={toggleOpen}
                      className="mb-0 overflow-hidden rounded-md border"
                    >
                      <div className="flex items-center gap-2 bg-muted/30 p-3">
                        <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          <ChevronDown className="h-4 w-4 shrink-0 transition-transform ui-open:rotate-180" />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <p className="truncate text-sm font-medium">
                              {displayName}
                            </p>
                            {appleAppId.trim() ? (
                              <p className="truncate font-mono text-xs text-muted-foreground">
                                {appleAppId}
                              </p>
                            ) : null}
                          </div>
                        </CollapsibleTrigger>
                        <CredentialBadge fields={extraFields} isExtra={true} />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          aria-label={`Remove ${displayName}`}
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="mr-1.5 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                      <CollapsibleContent>
                        <div className="space-y-4 p-4">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <InputField
                              fieldName={`clients.${index}.id`}
                              label="Nickname"
                              description="Unique identifier for this client"
                            />
                            <InputField
                              fieldName={`clients.${index}.clientId`}
                              label="Apple app ID"
                              description="Apple Services ID or bundle ID"
                            />
                          </div>
                          <InputField
                            fieldName={`clients.${index}.name`}
                            label="Name (optional)"
                            description="Admin label for this client"
                          />
                          <InputField
                            fieldName={`clients.${index}.redirect_uri`}
                            label="Redirect URI (optional)"
                            description="Leave empty to reuse the default redirect URI"
                          />
                          <p className="text-xs text-muted-foreground">
                            Leave all three fields below empty to reuse the
                            default key, or provide all three for a second Apple
                            team:
                          </p>
                          <FormField
                            control={form.control}
                            name={`clients.${index}.privateKey` as any}
                            render={({ field }) => (
                              <FormItem className="w-full space-y-1.5">
                                <FormLabel className="flex gap-2 pl-1 text-base font-medium text-text-body">
                                  Private Key (optional)
                                </FormLabel>
                                <FormControl>
                                  <SecretTextarea placeholder="" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <InputField
                              fieldName={`clients.${index}.teamId`}
                              label="Team ID (optional)"
                            />
                            <InputField
                              fieldName={`clients.${index}.keyId`}
                              label="Key ID (optional)"
                            />
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() =>
                append({
                  id: '',
                  clientId: '',
                  name: '',
                  redirect_uri: '',
                  privateKey: '',
                  teamId: '',
                  keyId: '',
                })
              }
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add client
            </Button>
          </section>

          <div className="flex flex-row gap-1 mt-4 justify-end">
            <Button type="reset" disabled={isSubmitting} onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Save
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
