'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { rhfZodResolver } from '@/lib/zod-form';
import { oauthProviderSettingsSchema } from '@/components/authentication/strategies/settingsConfig/oAuth/oauthDefaultConfig';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import { Button } from '@/components/ui/button';
import { StrategyFormProps } from '@/components/authentication/strategies/interface/StrategyFormProps.interface';
import React from 'react';
import { Form } from '@/components/ui/form';
import {
  AppleAdditionalClientsSection,
  AppleDefaultClientSection,
} from '@/components/authentication/strategies/settingsConfig/oAuth/appleClientsSection';

export const appleClientEntrySchema = z.object({
  id: z.string().default(''),
  name: z.string().default(''),
  clientId: z.string().default(''),
  teamId: z.string().default(''),
  keyId: z.string().default(''),
  privateKey: z.string().default(''),
  redirect_uri: z.string().default(''),
});

type authStrategyFormType = z.infer<typeof authStrategySchema>;
const authStrategySchema = oauthProviderSettingsSchema.extend({
  privateKey: z.string().default(''),
  teamId: z.string().default(''),
  keyId: z.string().default(''),
  clients: z.array(appleClientEntrySchema).default([]),
});

export const AppleConfigForm: React.FC<
  StrategyFormProps<authStrategyFormType>
> = ({ data, onSubmit, onCancel }) => {
  const form = useForm<authStrategyFormType>({
    resolver: rhfZodResolver(authStrategySchema),
    defaultValues: { ...data, clients: data?.clients ?? [] },
  });
  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <SwitchField fieldName={'enabled'} label={'Enabled'} />
            <SwitchField
              fieldName={'accountLinking'}
              label={'Account Linking'}
            />
          </div>

          <AppleDefaultClientSection />
          <AppleAdditionalClientsSection />

          <div className="flex flex-row justify-end gap-2 pt-2">
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
