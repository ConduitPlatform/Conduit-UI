'use client';
import { z } from 'zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { rhfZodResolver } from '@/lib/zod-form';
import { oauthDefaultConfig } from '@/components/authentication/strategies/settingsConfig/oAuth/oauthDefaultConfig';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import { InputField } from '@/components/ui/form-inputs/InputField';
import { Button } from '@/components/ui/button';
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
import { SecretTextarea } from '@/components/ui/secret-textarea';
import { Plus, Trash2 } from 'lucide-react';

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
  .refine(
    data => {
      const ids = data.clients.map(c => c.id.trim().toLowerCase());
      const uniqueIds = new Set(ids);
      return ids.length === uniqueIds.size;
    },
    {
      message: 'All nicknames must be unique',
      path: ['clients'],
    }
  );

export const AppleConfigForm: React.FC<
  StrategyFormProps<authStrategyFormType>
> = ({ data, onSubmit, onCancel }) => {
  const form = useForm<authStrategyFormType>({
    resolver: rhfZodResolver(authStrategySchema),
    defaultValues: data
      ? { ...data, clients: data.clients || [] }
      : { clients: [] },
  });
  const { isSubmitting } = form.formState;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'clients',
  });

  const handleFormSubmit = (formData: authStrategyFormType) => {
    const processedData = {
      ...formData,
      clients: formData.clients.map(client => ({
        ...client,
        id: client.id.trim(),
        clientId: client.clientId.trim(),
      })),
    };
    onSubmit(processedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className={'flex flex-col gap-1'}>
          <div className={'flex flex-row gap-x-1'}>
            <SwitchField fieldName={'enabled'} label={'Enabled'} />
            <SwitchField
              fieldName={'accountLinking'}
              label={'Account Linking'}
            />
          </div>

          <h3 className="text-sm font-semibold mt-4 mb-2">
            Default Apple Configuration
          </h3>

          <div className={'flex flex-row gap-x-1'}>
            <InputField fieldName={'teamId'} label={'Team ID'} />
            <InputField fieldName={'clientId'} label={'Client ID'} />
          </div>

          <InputField fieldName={'keyId'} label={'Private key ID'} />
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
          <div className={'flex flex-row gap-x-1 items-center'}>
            <InputField fieldName={'redirect_uri'} label={'Redirect URI'} />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Extra Apple Clients</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
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
                <Plus className="h-4 w-4 mr-1" />
                Add Client
              </Button>
            </div>

            {fields.length > 0 && (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-md p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Client {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="flex flex-row gap-x-1">
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
                    />

                    <InputField
                      fieldName={`clients.${index}.redirect_uri`}
                      label="Redirect URI (optional)"
                      description="Leave empty to reuse the default redirect URI"
                    />

                    <p className="text-xs text-muted-foreground mt-3 mb-2">
                      Leave all three fields below empty to reuse the default
                      key, or provide all three for a second Apple team:
                    </p>

                    <FormField
                      control={form.control}
                      name={`clients.${index}.privateKey`}
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

                    <div className="flex flex-row gap-x-1">
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
                ))}
              </div>
            )}
          </div>

          <div className={'flex flex-row gap-1 mt-4 justify-end'}>
            <Button type={'reset'} disabled={isSubmitting} onClick={onCancel}>
              Cancel
            </Button>
            <Button type={'submit'} disabled={isSubmitting}>
              Save
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
