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
import SelectField from '@/components/ui/form-inputs/SelectField';

type authStrategyFormType = z.infer<typeof authStrategySchema>;
const authStrategySchema = z.object({
  enabled: z.boolean().default(true),
  verification: z.object({
    required: z.boolean().default(false),
    send_email: z.boolean().default(false),
    method: z.string().default(''),
    redirect_uri: z.string().default(''),
    resend_threshold: z.number().int().min(0).default(60000),
  }),
  forgot_password_redirect_uri: z.string().default(''),
  username_auth_enabled: z.boolean().default(false),
});

export const LocalConfigForm: React.FC<
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
          <div className={'flex flex-row gap-x-1'}>
            <SwitchField
              fieldName={'verification.required'}
              label={'Email verification required'}
            />
            {form.watch('verification.required') && (
              <SwitchField
                fieldName={'verification.send_email'}
                label={'Send verification email'}
              />
            )}
          </div>
          {form.watch('verification.send_email') && (
            <>
              <SelectField
                fieldName={'verification.method'}
                label={'Verification method'}
                options={[
                  { label: 'Link', value: 'link' },
                  { label: 'Code', value: 'code' },
                ]}
                description={
                  'Specify if the user will receive a link or a code to verify their email'
                }
              />
              <InputField
                fieldName={'verification.redirect_uri'}
                label={'Verification redirect URI'}
                description={
                  'Specify where the user will be redirected to after verifying their email'
                }
              />
              <InputField
                fieldName={'verification.resend_threshold'}
                label={'Verification Resend Threshold (ms)'}
                type={'number'}
                description={
                  'Specify the threshold in milliseconds for resending verification emails'
                }
              />
            </>
          )}
          <div className={'flex flex-row gap-x-1 items-center'}>
            <InputField
              fieldName={'forgot_password_redirect_uri'}
              label={'Forgot password redirect URI'}
              description={
                'Specify where the user will be redirected to after clicking the forgot password link in their email'
              }
            />
          </div>
          <div className={'flex flex-row gap-x-1 items-center'}>
            <InputField
              fieldName={'username_auth_enabled'}
              label={'Username authentication enabled'}
              description={
                'Specify whether users can login using usernames instead of email addresses'
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
