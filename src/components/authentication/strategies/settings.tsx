'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { rhfZodResolver } from '@/lib/zod-form';
import { Form } from '@/components/ui/form';
import * as React from 'react';
import { useState } from 'react';
import { useSettingsSave } from '@/lib/hooks/use-settings-save';
import { SettingsFormActions } from '@/components/settings/SettingsFormActions';
import { AuthenticationConfig } from '@/lib/models/authentication';
import { EmailRestrictions } from '@/lib/models/authentication/base.config';
import { patchAuthenticationSettings } from '@/lib/api/authentication';
import { InputField } from '@/components/ui/form-inputs/InputField';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { UrlTagInput } from '@/components/ui/form-inputs/TagInputField';
import { ChevronDown } from 'lucide-react';

const tokensSchema = z.object({
  httpOnly: z.boolean().default(true),
  secure: z.boolean().default(false),
  signed: z.boolean().default(false),
  domain: z.string().default(''),
  path: z.string().default(''),
  sameSite: z.string().default('Lax'),
});
const accessTokenSchema = z.object({
  jwtSecret: z.string().default('S3CR3T'),
  expiryPeriod: z.number().default(3600000),
  setCookie: z.boolean().default(false),
  cookieOptions: tokensSchema,
});

const refreshTokenSchema = z.object({
  enabled: z.boolean().default(true),
  expiryPeriod: z.number().default(86400000 * 7),
  setCookie: z.boolean().default(false),
  cookieOptions: tokensSchema,
});

const clientsSchema = z.object({
  multipleUserSessions: z.boolean().default(false),
  multipleClientLogins: z.boolean().default(true),
});
const teamsSchema = z.object({
  enabled: z.boolean().default(false),
  enableDefaultTeam: z.boolean().default(false),
  allowAddWithoutInvite: z.boolean().default(false),
  allowRegistrationWithoutInvite: z.boolean().default(true),
  allowEmailMismatchForInvites: z.boolean().default(false),
  invites: z.object({
    enabled: z.boolean().default(false),
    sendEmail: z.boolean().default(false),
    inviteUrl: z.string().default('https://mydomain.conduit/invite'),
  }),
});

const domainTagSchema = z
  .string()
  .min(1)
  .refine(value => !value.includes('@'), 'Enter a domain, not an email address')
  .refine(value => !/^https?:\/\//i.test(value), 'Enter a hostname without a scheme')
  .refine(value => value.includes('.'), 'Enter a domain with at least one dot');

const emailRestrictionsSchema = z.object({
  enabled: z.boolean().default(false),
  blockDisposableEmails: z.boolean().default(true),
  blockPlusAddressing: z.boolean().default(true),
  blockedAddresses: z
    .array(z.string().email('Please enter a valid email address'))
    .default([]),
  blockedDomains: z.array(domainTagSchema).default([]),
  allowedAddresses: z
    .array(z.string().email('Please enter a valid email address'))
    .default([]),
  allowedDomains: z.array(domainTagSchema).default([]),
});

const defaultEmailRestrictions: EmailRestrictions = {
  enabled: false,
  blockDisposableEmails: true,
  blockPlusAddressing: true,
  blockedAddresses: [],
  blockedDomains: [],
  allowedAddresses: [],
  allowedDomains: [],
};

const FormSchema = z.object({
  captcha: z.object({
    enabled: z.boolean().default(false),
    routes: z.object({
      login: z.boolean().default(false),
      register: z.boolean().default(false),
      oAuth2: z.boolean().default(false),
    }),
    acceptablePlatform: z.object({
      android: z.boolean().default(false),
      web: z.boolean().default(true),
    }),
  }),
  redirectUris: z.object({
    allowAny: z.boolean().default(false),
    whitelistedUris: z.array(
      z.string().url({ message: 'Please enter a valid URL' })
    ),
  }),
  anonymousUsers: z.object({
    enabled: z.boolean().default(false),
  }),
  emailRestrictions: emailRestrictionsSchema,
  teams: teamsSchema,
  clients: clientsSchema,
  accessTokens: accessTokenSchema,
  refreshTokens: refreshTokenSchema,
});

interface Props {
  data: AuthenticationConfig;
}

export const AuthenticationSettings = ({ data }: Props) => {
  const [edit, setEdit] = useState<boolean>(false);
  const { save, isSaving } = useSettingsSave('Authentication');
  type formSchema = z.infer<typeof FormSchema>;
  const form = useForm<formSchema>({
    resolver: rhfZodResolver(FormSchema),
    defaultValues: {
      ...data,
      emailRestrictions: {
        ...defaultEmailRestrictions,
        ...(data.emailRestrictions ?? {}),
      },
    },
  });

  const { reset, control, handleSubmit, watch } = form;

  const onSubmit = async (formData: formSchema) => {
    const result = await save({
      action: () => patchAuthenticationSettings(formData),
    });
    if (result.ok) {
      setEdit(false);
    }
  };

  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={'flex flex-col gap-4'}>
            <div className={'flex flex-col gap-2'}>
              <p className={'text-2xl font-medium'}>General</p>
              <p className={'text-xs text-muted-foreground w-9/12'}>
                Authentication provides you with various authentication
                strategies for your application/platform. You can configure
                those, along with two-factor authentication, biometric/passkey
                and various customizations for your general posture. See{' '}
                <a
                  href={'https://getconduit.dev/docs/modules/authentication/'}
                  className="underline"
                  target="_blank"
                >
                  more.
                </a>
              </p>
            </div>

            <Collapsible
              key={`access-tokens`}
              className="border rounded-md overflow-hidden mb-4"
            >
              <div className="flex items-center justify-between p-3 bg-muted/30">
                <div className="flex items-center space-x-2 grow">
                  <CollapsibleTrigger className="flex items-center space-x-2 grow text-left">
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform ui-open:rotate-180" />
                    <span className="font-medium truncate text-xl">
                      Access Token settings
                    </span>
                  </CollapsibleTrigger>
                </div>
              </div>

              <CollapsibleContent className={'p-4'}>
                <div className={'flex flex-col space-y-4 '}>
                  <div className={'flex flex-row space-x-4'}>
                    <InputField
                      label={'JWT Secret'}
                      fieldName={'accessTokens.jwtSecret'}
                      defaultValue={'S3CR3T'}
                      disabled={!edit}
                    />
                    <InputField
                      type={'number'}
                      label={'Expiry Period (ms)'}
                      fieldName={'accessTokens.expiryPeriod'}
                      defaultValue={3600000}
                      onChange={e => {
                        form.setValue(
                          'accessTokens.expiryPeriod',
                          parseInt(e.target.value)
                        );
                      }}
                      disabled={!edit}
                    />
                  </div>
                  <SwitchField
                    label={'Use Cookies'}
                    fieldName={'accessTokens.setCookie'}
                    disabled={!edit}
                  />
                  {form.watch('accessTokens.setCookie') && (
                    <div className={'grid grid-cols-2 gap-4 items-center'}>
                      <InputField
                        label={'Domain'}
                        fieldName={'accessTokens.cookieOptions.domain'}
                        disabled={!edit}
                      />
                      <InputField
                        label={'Path'}
                        fieldName={'accessTokens.cookieOptions.path'}
                        disabled={!edit}
                      />
                      <InputField
                        label={'SameSite'}
                        fieldName={'accessTokens.cookieOptions.sameSite'}
                        disabled={!edit}
                      />
                      <SwitchField
                        label={'Secure'}
                        fieldName={'accessTokens.cookieOptions.secure'}
                        disabled={!edit}
                      />
                      <SwitchField
                        label={'HTTP Only'}
                        fieldName={'accessTokens.cookieOptions.httpOnly'}
                        disabled={!edit}
                      />
                      <SwitchField
                        label={'Signed'}
                        fieldName={'accessTokens.cookieOptions.signed'}
                        disabled={!edit}
                      />
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
            <Collapsible
              key={`refresh-tokens`}
              className="border rounded-md overflow-hidden mb-4"
            >
              <div className="flex items-center justify-between p-3 bg-muted/30">
                <div className="flex items-center space-x-2 grow">
                  <CollapsibleTrigger className="flex items-center space-x-2 grow text-left">
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform ui-open:rotate-180" />
                    <span className="font-medium truncate text-xl">
                      Refresh Token settings
                    </span>
                  </CollapsibleTrigger>
                </div>
              </div>

              <CollapsibleContent className={'p-4 space-y-4'}>
                <SwitchField
                  label={'Enabled'}
                  fieldName={'refreshTokens.enabled'}
                  disabled={!edit}
                />
                {form.watch('refreshTokens.enabled') && (
                  <div className={'flex flex-col space-y-4'}>
                    <div className={'flex flex-row space-x-4'}>
                      <InputField
                        type={'number'}
                        label={'Expiry Period (ms)'}
                        fieldName={'refreshTokens.expiryPeriod'}
                        defaultValue={86400000 * 7}
                        onChange={e => {
                          form.setValue(
                            'refreshTokens.expiryPeriod',
                            parseInt(e.target.value)
                          );
                        }}
                        disabled={!edit}
                      />
                    </div>
                    <SwitchField
                      label={'Use Cookies'}
                      fieldName={'refreshTokens.setCookie'}
                      disabled={!edit}
                    />
                    {form.watch('refreshTokens.setCookie') && (
                      <div className={'grid grid-cols-2 gap-4 items-center'}>
                        <InputField
                          label={'Domain'}
                          fieldName={'refreshTokens.cookieOptions.domain'}
                          disabled={!edit}
                        />
                        <InputField
                          label={'Path'}
                          fieldName={'refreshTokens.cookieOptions.path'}
                          disabled={!edit}
                        />
                        <InputField
                          label={'SameSite'}
                          fieldName={'refreshTokens.cookieOptions.sameSite'}
                          disabled={!edit}
                        />
                        <SwitchField
                          label={'Secure'}
                          fieldName={'refreshTokens.cookieOptions.secure'}
                          disabled={!edit}
                        />
                        <SwitchField
                          label={'HTTP Only'}
                          fieldName={'refreshTokens.cookieOptions.httpOnly'}
                          disabled={!edit}
                        />
                        <SwitchField
                          label={'Signed'}
                          fieldName={'refreshTokens.cookieOptions.signed'}
                          disabled={!edit}
                        />
                      </div>
                    )}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
            <Collapsible
              key={`teams-settings`}
              className="border rounded-md overflow-hidden mb-4"
            >
              <div className="flex items-center justify-between p-3 bg-muted/30">
                <div className="flex items-center space-x-2 grow">
                  <CollapsibleTrigger className="flex items-center space-x-2 grow text-left">
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform ui-open:rotate-180" />
                    <span className="font-medium truncate text-xl">
                      Teams settings
                    </span>
                  </CollapsibleTrigger>
                </div>
              </div>

              <CollapsibleContent className={'p-4 space-y-4'}>
                <SwitchField
                  label={'Enabled'}
                  fieldName={'teams.enabled'}
                  disabled={!edit}
                />
                {form.watch('teams.enabled') && (
                  <div className={'flex flex-col space-y-4'}>
                    <div className={'grid grid-cols-2 gap-4 items-center'}>
                      <SwitchField
                        label={'Enable default team'}
                        fieldName={'teams.enableDefaultTeam'}
                        disabled={!edit}
                      />
                      <SwitchField
                        label={'Allow add without invite'}
                        fieldName={'teams.allowAddWithoutInvite'}
                        disabled={!edit}
                      />
                      <SwitchField
                        label={'Allow registration without an invite'}
                        fieldName={'teams.allowRegistrationWithoutInvite'}
                        disabled={!edit}
                      />
                      <SwitchField
                        label={'Allow email mismatch for invites'}
                        fieldName={'teams.allowEmailMismatchForInvites'}
                        disabled={!edit}
                      />
                    </div>
                    <h1 className="text-xl font-medium pt-2">Invites</h1>
                    <div className={'grid grid-cols-2 gap-4 items-center'}>
                      <SwitchField
                        label={'Enabled'}
                        fieldName={'teams.invites.enabled'}
                        disabled={!edit}
                      />
                      <SwitchField
                        label={'Send email'}
                        fieldName={'teams.invites.sendEmail'}
                        disabled={!edit}
                      />
                      <InputField
                        label={'Invite URL'}
                        fieldName={'teams.invites.inviteUrl'}
                        disabled={!edit}
                      />
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
            <Collapsible
              key={`client-settings`}
              className="border rounded-md overflow-hidden mb-4"
            >
              <div className="flex items-center justify-between p-3 bg-muted/30">
                <div className="flex items-center space-x-2 grow">
                  <CollapsibleTrigger className="flex items-center space-x-2 grow text-left">
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform ui-open:rotate-180" />
                    <span className="font-medium truncate text-xl">
                      Session & redirect settings
                    </span>
                  </CollapsibleTrigger>
                </div>
              </div>

              <CollapsibleContent className={'p-4 space-y-4'}>
                <div className={'grid grid-cols-2 space-y-4'}>
                  <SwitchField
                    label={'Multiple user sessions in different clients'}
                    fieldName={'clients.multipleUserSessions'}
                    disabled={!edit}
                  />
                  <SwitchField
                    label={'Multiple same-client sessions'}
                    fieldName={'clients.multipleClientLogins'}
                    disabled={!edit}
                  />
                  <SwitchField
                    label={'Allow anonymous users'}
                    fieldName={'anonymousUsers.enabled'}
                    disabled={!edit}
                  />
                  <SwitchField
                    label={'Allow any Redirect URI'}
                    fieldName={'redirectUris.allowAny'}
                    disabled={!edit}
                  />
                  <UrlTagInput
                    name="redirectUris.whitelistedUris"
                    label="Whitelisted URLs"
                    description="Enter the URLs you want to whitelist for your application"
                    placeholder="Type a URL and press Enter or Space..."
                    className={'col-span-2'}
                    disabled={!edit}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
            <Collapsible
              key={`captcha-settings`}
              className="border rounded-md overflow-hidden mb-4"
            >
              <div className="flex items-center justify-between p-3 bg-muted/30">
                <div className="flex items-center space-x-2 grow">
                  <CollapsibleTrigger className="flex items-center space-x-2 grow text-left">
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform ui-open:rotate-180" />
                    <span className="font-medium truncate text-xl">
                      Captcha settings
                    </span>
                  </CollapsibleTrigger>
                </div>
              </div>

              <CollapsibleContent className={'p-4 space-y-4'}>
                <SwitchField
                  label={'Enabled'}
                  fieldName={'captcha.enabled'}
                  disabled={!edit}
                />
                {form.watch('captcha.enabled') && (
                  <div className={'flex flex-col space-y-4'}>
                    <h1 className="text-lg font-medium pt-2">
                      Enabled for the following routes:
                    </h1>
                    <div className={'grid grid-cols-2 gap-4 items-center'}>
                      <SwitchField
                        label={'Login'}
                        fieldName={'captcha.routes.login'}
                        disabled={!edit}
                      />
                      <SwitchField
                        label={'Register'}
                        fieldName={'captcha.routes.register'}
                        disabled={!edit}
                      />
                      <SwitchField
                        label={'OAuth2'}
                        fieldName={'captcha.routes.oAuth2'}
                        disabled={!edit}
                      />
                    </div>
                    <h1 className="text-lg font-medium pt-2">
                      Acceptable Platforms
                    </h1>
                    <div className={'grid grid-cols-2 gap-4 items-center'}>
                      <SwitchField
                        label={'Android'}
                        fieldName={'captcha.acceptablePlatform.android'}
                        disabled={!edit}
                      />
                      <SwitchField
                        label={'Web'}
                        fieldName={'captcha.acceptablePlatform.web'}
                        disabled={!edit}
                      />
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
            <Collapsible
              key="email-restrictions"
              className="border rounded-md overflow-hidden mb-4"
            >
              <div className="flex items-center justify-between p-3 bg-muted/30">
                <div className="flex items-center space-x-2 grow">
                  <CollapsibleTrigger className="flex items-center space-x-2 grow text-left">
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform ui-open:rotate-180" />
                    <span className="font-medium truncate text-xl">
                      Email restrictions
                    </span>
                  </CollapsibleTrigger>
                </div>
              </div>

              <CollapsibleContent className={'p-4 space-y-4'}>
                <SwitchField
                  label={'Enabled'}
                  fieldName={'emailRestrictions.enabled'}
                  disabled={!edit}
                />
                <p className="text-sm text-muted-foreground">
                  Applies when an email is accepted (registration, email
                  change, invites). Existing users can still log in.{' '}
                  <code>@anonymous.com</code> is reserved for Conduit anonymous
                  users and cannot be registered.
                </p>
                {form.watch('emailRestrictions.enabled') && (
                  <div className={'flex flex-col space-y-4'}>
                    <div className={'grid grid-cols-2 gap-4 items-center'}>
                      <SwitchField
                        label={'Block disposable emails'}
                        fieldName={'emailRestrictions.blockDisposableEmails'}
                        disabled={!edit}
                      />
                      <SwitchField
                        label={'Block plus-address aliases'}
                        fieldName={'emailRestrictions.blockPlusAddressing'}
                        disabled={!edit}
                      />
                    </div>
                    <UrlTagInput
                      name="emailRestrictions.blockedAddresses"
                      label="Blocked email addresses"
                      description="Exact email addresses."
                      placeholder="Type an email and press Enter..."
                      disabled={!edit}
                    />
                    <UrlTagInput
                      name="emailRestrictions.blockedDomains"
                      label="Blocked domains"
                      description="Matches this domain and its subdomains (suffix match)."
                      placeholder="Type a domain and press Enter..."
                      disabled={!edit}
                    />
                    <UrlTagInput
                      name="emailRestrictions.allowedAddresses"
                      label="Allowed email addresses"
                      description="Exact addresses that override blocks (not reserved anonymous.com)."
                      placeholder="Type an email and press Enter..."
                      disabled={!edit}
                    />
                    <UrlTagInput
                      name="emailRestrictions.allowedDomains"
                      label="Allowed domains"
                      description="Matches this domain and its subdomains (suffix match)."
                      placeholder="Type a domain and press Enter..."
                      disabled={!edit}
                    />
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
          <SettingsFormActions
            edit={edit}
            isSaving={isSaving}
            onEdit={() => setEdit(true)}
            onCancel={() => {
              reset();
              setEdit(false);
            }}
          />
        </form>
      </Form>
    </div>
  );
};
