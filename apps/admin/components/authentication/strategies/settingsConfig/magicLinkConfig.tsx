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

type authStrategyFormType = z.infer<typeof authStrategySchema>;
const authStrategySchema = z.object({
  enabled: z.boolean().default(true),
  redirect_uri: z.string().default(''),
  link_uri: z.string().default(''),
});

export const MagicLinkConfigForm: React.FC<
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
          </div>
          <div className={'flex flex-row gap-x-1 items-center'}>
            <InputField
              fieldName={'redirect_uri'}
              label={'Success redirect URI'}
              description={
                'Specify where the user will be redirected to after successful consumption of the magic link'
              }
            />
          </div>
          <div className={'flex flex-row gap-x-1 items-center'}>
            <InputField
              fieldName={'link_uri'}
              label={'Forgot password redirect URI (optional)'}
              description={
                'Specify where the user will be redirected to after clicking the magic link in their email. If provided you need to manually exchange the magic link token for an access token'
              }
            />
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
