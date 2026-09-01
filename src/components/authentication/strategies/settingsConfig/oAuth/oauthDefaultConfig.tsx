'use client';
import { z } from 'zod';

import { useForm } from 'react-hook-form';
import { rhfZodResolver } from '@/lib/zod-form';
import React from 'react';
import { StrategyFormProps } from '@/components/authentication/strategies/interface/StrategyFormProps.interface';
import { Form } from '@/components/ui/form';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import { InputField } from '@/components/ui/form-inputs/InputField';
import { Button } from '@/components/ui/button';

export const oauthProviderSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  clientId: z.string().default(''),
  clientSecret: z.string().default(''),
  redirect_uri: z.string().default(''),
  accountLinking: z.boolean().default(true),
});

type authStrategyFormType = z.infer<typeof authStrategySchema>;
const authStrategySchema = oauthProviderSettingsSchema;

export const OauthDefaultConfigForm: React.FC<
  StrategyFormProps<authStrategyFormType>
> = ({ data, onSubmit, onCancel }) => {
  const form = useForm<authStrategyFormType>({
    resolver: rhfZodResolver(authStrategySchema),
    defaultValues: data ? { ...data } : {},
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputField fieldName={'clientId'} label={'Client ID'} />
            <InputField
              fieldName={'clientSecret'}
              label={'Client Secret'}
              type="password"
            />
          </div>
          <InputField fieldName={'redirect_uri'} label={'Redirect URI'} />
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
