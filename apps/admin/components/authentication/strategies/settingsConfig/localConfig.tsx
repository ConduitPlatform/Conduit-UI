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
  verification: z.object({
    required: z.boolean().default(false),
    send_email: z.boolean().default(false),
    redirect_uri: z.string().default(''),
  }),
  forgot_password_redirect_uri: z.string().default(''),
});

export const LocalConfigForm: React.FC<StrategyFormProps<authStrategyFormType>> = ({
                                                                                     data,
                                                                                     onSubmit,
                                                                                     onCancel,
                                                                                   }) => {
  const form = useForm<authStrategyFormType>({
    resolver: zodResolver(authStrategySchema),
    defaultValues: data ? { ...data } : {},
  });
  const { isSubmitting } = form.formState;
  return <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className={'flex flex-col gap-1'}>
        <div className={'flex flex-row gap-x-1'}>
          <SwitchField fieldName={'enabled'} label={'Enabled'} />
        </div>
        <div className={'flex flex-row gap-x-1'}>
          <SwitchField fieldName={'verification.required'} label={'Email verification required'} />
          {form.watch('verification.required') &&
            <SwitchField fieldName={'verification.send_email'} label={'Send verification email'} />}
        </div>
        {form.watch('verification.send_email') &&
          <InputField fieldName={'.verification.redirect_uri'} label={'Verification redirect URI'}
                      description={'Specify where the user will be redirected to after verifying their email'} />}
        <div className={'flex flex-row gap-x-1 items-center'}>
          <InputField fieldName={'forgot_password_redirect_uri'} label={'Forgot password redirect URI'}
                      description={'Specify where the user will be redirected to after clicking the forgot password link in their email'} />
        </div>
        <div className={'flex flex-row gap-1 mt-4 justify-end'}>
          <Button type={'reset'} disabled={isSubmitting} onClick={onCancel}>Cancel</Button>
          <Button type={'submit'} disabled={isSubmitting}>Save</Button>
        </div>

      </div>
    </form>
  </Form>;
};
