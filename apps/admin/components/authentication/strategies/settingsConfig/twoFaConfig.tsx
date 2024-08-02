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
import { Label } from '@/components/ui/label';

type authStrategyFormType = z.infer<typeof authStrategySchema>;
const authStrategySchema = z.object({
  enabled: z.boolean().default(true),
  methods: z.object({
    authenticator: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  backUpCodes: z.boolean().default(true),
});

export const TwoFaConfigForm: React.FC<StrategyFormProps<authStrategyFormType>> = ({
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
        <SwitchField fieldName={'enabled'} label={'Enabled'} />

        <Label>Enabled 2-FA methods:</Label>

        <div className={'flex flex-row gap-x-1 items-center'}>
          <SwitchField fieldName={'methods.authenticator'} label={'Authenticator apps'} />
          <SwitchField fieldName={'methods.sms'} label={'SMS OTP'} />
        </div>
        <SwitchField fieldName={'backUpCodes'} label={'Generate backup codes'} />

        <div className={'flex flex-row gap-1 mt-4 justify-end'}>
          <Button type={'reset'} disabled={isSubmitting} onClick={onCancel}>Cancel</Button>
          <Button type={'submit'} disabled={isSubmitting}>Save</Button>
        </div>

      </div>
    </form>
  </Form>;
};
