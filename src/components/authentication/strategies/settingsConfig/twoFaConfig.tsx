'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { rhfZodResolver } from '@/lib/zod-form';
import React from 'react';
import { StrategyFormProps } from '@/components/authentication/strategies/interface/StrategyFormProps.interface';
import { Form } from '@/components/ui/form';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import { InputField } from '@/components/ui/form-inputs/InputField';
import { UrlTagInput } from '@/components/ui/form-inputs/TagInputField';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DEFAULT_TWO_FA_ISSUER } from '@/lib/models/authentication/base.config';

const issuerName = z.string().trim().min(1, 'Enter an issuer name');

const authStrategySchema = z.object({
  enabled: z.boolean().default(true),
  methods: z.object({
    authenticator: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  backUpCodes: z
    .object({
      enabled: z.boolean().default(true),
    })
    .default({ enabled: true }),
  issuer: issuerName.default(DEFAULT_TWO_FA_ISSUER),
  allowedIssuers: z.array(issuerName).default([]),
});

type TwoFaFormValues = z.infer<typeof authStrategySchema>;

type TwoFaConfigInput = {
  enabled?: boolean;
  methods?: {
    authenticator?: boolean;
    sms?: boolean;
  };
  backUpCodes?: boolean | { enabled?: boolean };
  issuer?: string;
  allowedIssuers?: unknown;
};

function backupCodesEnabled(value: TwoFaConfigInput['backUpCodes']): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value?.enabled === 'boolean') return value.enabled;
  return true;
}

function allowedIssuerNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(entry => {
    if (typeof entry !== 'string') return [];
    const name = entry.trim();
    return name ? [name] : [];
  });
}

function twoFaFormValues(data: TwoFaConfigInput | undefined): TwoFaFormValues {
  const issuer = typeof data?.issuer === 'string' ? data.issuer.trim() : '';
  return {
    enabled: data?.enabled ?? true,
    methods: {
      authenticator: data?.methods?.authenticator ?? true,
      sms: data?.methods?.sms ?? false,
    },
    backUpCodes: { enabled: backupCodesEnabled(data?.backUpCodes) },
    issuer: issuer || DEFAULT_TWO_FA_ISSUER,
    allowedIssuers: allowedIssuerNames(data?.allowedIssuers),
  };
}

export const TwoFaConfigForm: React.FC<
  Omit<StrategyFormProps<TwoFaFormValues>, 'data'> & {
    data?: TwoFaConfigInput;
  }
> = ({ data, onSubmit, onCancel }) => {
  const form = useForm<TwoFaFormValues>({
    resolver: rhfZodResolver(authStrategySchema),
    defaultValues: twoFaFormValues(data),
  });
  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(values => {
          onSubmit(twoFaFormValues(values));
        })}
      >
        <div className="flex flex-col gap-1">
          <SwitchField fieldName="enabled" label="Enabled" />

          <Label>Enabled 2-FA methods:</Label>

          <div className="flex flex-row gap-x-1 items-center">
            <SwitchField
              fieldName="methods.authenticator"
              label="Authenticator apps"
            />
            <SwitchField fieldName="methods.sms" label="SMS OTP" />
          </div>

          <div className="my-3 flex flex-col gap-4">
            <InputField
              fieldName="issuer"
              label="Issuer"
              placeholder="conduit"
              description="Shown in authenticator apps when a user enables TOTP."
            />
            <UrlTagInput
              name="allowedIssuers"
              label="Allowed issuers"
              description="Client-supplied issuer names the 2FA enable route may accept. An empty list ignores client names."
              placeholder="Type an issuer and press Enter..."
              commitOnSpace={false}
            />
          </div>

          <SwitchField
            fieldName="backUpCodes.enabled"
            label="Generate backup codes"
          />

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
