'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
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
} from '@/components/ui/form';
import { SecretTextarea } from '@/components/ui/secret-textarea';

type authStrategyFormType = z.infer<typeof authStrategySchema>;
const authStrategySchema = oauthDefaultConfig.merge(
  z.object({
    privateKey: z.string().default(''),
    teamId: z.string().default(''),
    keyId: z.string().default(''),
  })
);

export const AppleConfigForm: React.FC<
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
        <div className={'flex flex-col gap-1'}>
          <div className={'flex flex-row gap-x-1'}>
            <SwitchField fieldName={'enabled'} label={'Enabled'} />
            <SwitchField
              fieldName={'accountLinking'}
              label={'Account Linking'}
            />
          </div>
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
                <FormLabel className="flex gap-2 pl-1 text-base font-medium text-foreground">
                  Private Key
                </FormLabel>
                <FormControl>
                  <SecretTextarea placeholder="" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
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
