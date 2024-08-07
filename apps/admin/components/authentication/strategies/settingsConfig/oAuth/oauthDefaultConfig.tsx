'use client';
import { z } from 'zod';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { StrategyFormProps } from '@/components/authentication/strategies/interface/StrategyFormProps.interface';
import { Form } from '@/components/ui/form';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import { InputField } from '@/components/ui/form-inputs/InputField';
import { Button } from '@/components/ui/button';

export const oauthDefaultConfig = z.object({
  enabled: z.boolean().default(false),
  clientId: z.string().default(''),
  clientSecret: z.string().default(''),
  redirect_uri: z.string().default(''),
  accountLinking: z.boolean().default(true),
});

type authStrategyFormType = z.infer<typeof authStrategySchema>;
const authStrategySchema = oauthDefaultConfig;

export const OauthDefaultConfigForm: React.FC<
  StrategyFormProps<authStrategyFormType>
> = ({ data, onSubmit, onCancel }) => {
  const form = useForm<authStrategyFormType>({
    resolver: zodResolver(authStrategySchema),
    defaultValues: data ? { ...data } : {},
  });
  const { isSubmitting } = form.formState;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className={'flex flex-col gap-1'}>
          <div className={'flex flex-row gap-x-1'}>
            <SwitchField fieldName={'enabled'} label={'Enabled'} />
            <SwitchField
              fieldName={'accountLinking'}
              label={'Account Linking'}
            />
          </div>
          <div className={'flex flex-row gap-x-1'}>
            <InputField fieldName={'clientId'} label={'Client ID'} />
            <InputField fieldName={'clientSecret'} label={'Client Secret'} />
          </div>
          <div className={'flex flex-row gap-x-1 items-center'}>
            <InputField fieldName={'redirect_uri'} label={'Redirect URI'} />
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
