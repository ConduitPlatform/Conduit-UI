'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { rhfZodResolver } from '@/lib/zod-form';
import { Form } from '@/components/ui/form';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDuration } from '@/lib/authentication/formatDuration';
import { useSettingsSave } from '@/lib/hooks/use-settings-save';
import { SettingsFormActions } from '@/components/settings/SettingsFormActions';
import { AuthenticationConfig } from '@/lib/models/authentication';
import { EmailRestrictions } from '@/lib/models/authentication/base.config';
import {
  rotateSigningKey,
  updateAuthenticationSettings,
} from '@/lib/api/authentication';
import { toast } from '@/lib/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { unwrapActionResult } from '@/lib/api/action-result';
import { InputField } from '@/components/ui/form-inputs/InputField';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import SelectField from '@/components/ui/form-inputs/SelectField';
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
// `tokenVersion` and `signing` are deliberately not part of the schema: they are
// backend-managed, so they are stripped from the save (the signing key rotates through
// its own action, and the private key is never read back).
const accessTokenSchema = z.object({
  // Optional, no default: an older backend that does not report these never receives them.
  mode: z.enum(['session', 'jwt']).optional(),
  jwtSecret: z.string().default(''),
  expiryPeriod: z.number().default(3600000),
  strictRevocation: z.boolean().optional(),
  setCookie: z.boolean().default(false),
  cookieOptions: tokensSchema,
});

const MINUTE_MS = 60_000;
const SESSION_DEFAULT_EXPIRY_MS = 3_600_000;
const JWT_DEFAULT_EXPIRY_MS = 5 * MINUTE_MS;
const JWT_EXPIRY_MINUTES = [1, 2, 3, 4, 5] as const;
const JWT_EXPIRY_OPTIONS = JWT_EXPIRY_MINUTES.map(minutes => ({
  label: `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`,
  value: String(minutes),
}));
const MODE_OPTIONS = [
  { label: 'Stateful sessions', value: 'session' },
  { label: 'Stateless JWT', value: 'jwt' },
];
const MODE_DESCRIPTIONS: Record<'session' | 'jwt', string> = {
  session: 'Access tokens are stored server-side and revoked instantly.',
  jwt: 'Short-lived signed tokens verified by each module. Logout revokes the refresh token; access tokens remain valid until they expire unless strict revocation is on.',
};
const JWT_EXPIRY_MESSAGE =
  'In JWT mode the expiry must be between 1 and 5 minutes (60000 to 300000 ms).';
const DEFAULT_REFRESH_MAX_LIFETIME_MS = 86400000 * 30;

const isJwtExpiryInRange = (ms: unknown) =>
  typeof ms === 'number' && ms >= MINUTE_MS && ms <= 5 * MINUTE_MS;

const isJwtExpiry = (ms: unknown) =>
  typeof ms === 'number' &&
  ms >= MINUTE_MS &&
  ms <= 5 * MINUTE_MS &&
  ms % MINUTE_MS === 0;

const refreshTokenSchema = z.object({
  enabled: z.boolean().default(true),
  expiryPeriod: z.number().default(86400000 * 7),
  extendable: z.boolean().optional(),
  maxLifetime: z.number().optional(),
  setCookie: z.boolean().default(false),
  cookieOptions: tokensSchema,
});

const clientsSchema = z.object({
  multipleUserSessions: z.boolean().default(false),
  multipleClientLogins: z.boolean().default(true),
});
const DEFAULT_REALM_CACHE_TTL_MS = 5000;

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
  // Older backends do not report `realms`: the whole object is optional so those configs
  // still parse and the key is never sent back to a backend that does not know it.
  realms: z
    .object({
      enabled: z.boolean().default(false),
      allowEmailDiscovery: z.boolean().default(false),
      cacheTtlMs: z.number().int().min(0).default(DEFAULT_REALM_CACHE_TTL_MS),
      // Optional, with no default: an absent value stays absent in the save, so backends
      // that predate these settings never receive them. Absent identity mode is `shared`.
      identityMode: z.enum(['shared', 'isolated']).optional(),
      discoveryLogin: z.boolean().optional(),
    })
    .optional(),
});

const domainTagSchema = z
  .string()
  .min(1)
  .refine(value => !value.includes('@'), 'Enter a domain, not an email address')
  .refine(
    value => !/^https?:\/\//i.test(value),
    'Enter a hostname without a scheme'
  )
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

const FormSchema = z
  .object({
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
  })
  .superRefine((value, ctx) => {
    if (
      value.accessTokens.mode === 'jwt' &&
      !isJwtExpiryInRange(value.accessTokens.expiryPeriod)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['accessTokens', 'expiryPeriod'],
        message: JWT_EXPIRY_MESSAGE,
      });
    }
  });

interface Props {
  data: AuthenticationConfig;
}

export const AuthenticationSettings = ({ data }: Props) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [signingKid, setSigningKid] = useState<string>(
    data.accessTokens?.signing?.kid ?? ''
  );
  const [rotating, setRotating] = useState(false);
  const router = useRouter();
  // Backends that predate the mode report none: they have no mode controls at all.
  const supportsMode = data.accessTokens?.mode !== undefined;
  const supportsStrictRevocation =
    data.accessTokens?.strictRevocation !== undefined;
  const supportsExtendable = data.refreshTokens?.extendable !== undefined;
  const supportsMaxLifetime = data.refreshTokens?.maxLifetime !== undefined;
  const [savedMode, setSavedMode] = useState<'session' | 'jwt'>(
    data.accessTokens?.mode ?? 'session'
  );
  // Expiry remembered per mode, so switching away and back restores it.
  const expiryByMode = useRef<{ session?: number; jwt?: number }>({
    [savedMode]: data.accessTokens?.expiryPeriod,
  });
  const incomingKid = data.accessTokens?.signing?.kid ?? '';
  useEffect(() => {
    setSigningKid(incomingKid);
  }, [incomingKid]);
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
  // Backends that predate realms omit `teams.realms`; hide the controls for them.
  const supportsRealms = data.teams?.realms !== undefined;
  // Older realm blocks omit these keys: their controls are hidden, and the keys stay out
  // of the save (an absent field is never registered with a value).
  const supportsIdentityMode = data.teams?.realms?.identityMode !== undefined;
  const supportsDiscoveryLogin =
    data.teams?.realms?.discoveryLogin !== undefined;

  const mode = watch('accessTokens.mode') ?? 'session';
  const isJwt = mode === 'jwt';
  const expiryMs = watch('accessTokens.expiryPeriod');
  const maxLifetimeText = formatDuration(watch('refreshTokens.maxLifetime'));
  const jwtExpiryKnown = isJwtExpiry(expiryMs);
  const expiryError = form.formState.errors.accessTokens?.expiryPeriod?.message;

  const changeMode = (next: string) => {
    const nextMode = next === 'jwt' ? 'jwt' : 'session';
    const outgoing = form.getValues('accessTokens.mode') ?? 'session';
    if (nextMode === outgoing) return;
    expiryByMode.current[outgoing] = form.getValues(
      'accessTokens.expiryPeriod'
    );
    form.setValue('accessTokens.mode', nextMode, { shouldDirty: true });
    const remembered = expiryByMode.current[nextMode];
    // jwt mode only accepts 1-5 minutes, so a missing or invalid memory falls back.
    const nextExpiry =
      nextMode === 'jwt'
        ? isJwtExpiry(remembered)
          ? (remembered as number)
          : JWT_DEFAULT_EXPIRY_MS
        : typeof remembered === 'number' && !isJwtExpiryInRange(remembered)
          ? remembered
          : SESSION_DEFAULT_EXPIRY_MS;
    form.setValue('accessTokens.expiryPeriod', nextExpiry, {
      shouldDirty: true,
    });
  };

  const onRotate = async () => {
    setRotating(true);
    try {
      const result = await rotateSigningKey();
      if (result.ok) {
        setSigningKid(result.data.kid);
        toast({
          title: 'Signing key rotated',
          description: `New key id: ${result.data.kid}`,
        });
      } else {
        toast({
          title: 'Failed to rotate signing key',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to rotate signing key',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    } finally {
      setRotating(false);
    }
  };

  const onSubmit = async (formData: formSchema) => {
    const result = await save({
      // The backend's refusal (e.g. an identity mode that cannot go back to shared) is
      // carried in the ActionResult; unwrapping throws it with that message to the toast.
      action: async () =>
        unwrapActionResult(await updateAuthenticationSettings(formData)),
    });
    if (result.ok) {
      // The saved values become the baseline, so Cancel and the mode warning follow them.
      reset(formData);
      setSavedMode(formData.accessTokens.mode ?? 'session');
      expiryByMode.current = {
        [formData.accessTokens.mode ?? 'session']:
          formData.accessTokens.expiryPeriod,
      };
      setEdit(false);
      // Re-read the config: a first jwt save generates the signing key.
      router.refresh();
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

            {supportsMode && (
              <Collapsible
                key={`session-mode`}
                className="border rounded-md overflow-hidden mb-4"
              >
                <div className="flex items-center justify-between p-3 bg-muted/30">
                  <div className="flex items-center space-x-2 grow">
                    <CollapsibleTrigger className="flex items-center space-x-2 grow text-left">
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform ui-open:rotate-180" />
                      <span className="font-medium truncate text-xl">
                        Session mode
                      </span>
                    </CollapsibleTrigger>
                  </div>
                </div>

                <CollapsibleContent className={'p-4'}>
                  <div className={'flex flex-col space-y-4'}>
                    <SelectField
                      label={'Mode'}
                      fieldName={'accessTokens.mode'}
                      options={MODE_OPTIONS}
                      onValueChange={changeMode}
                      disabled={!edit}
                    />
                    <p className={'text-xs text-muted-foreground'}>
                      {MODE_DESCRIPTIONS[isJwt ? 'jwt' : 'session']}
                    </p>
                    {mode !== savedMode && (
                      <p
                        role="alert"
                        className={
                          'text-sm rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive'
                        }
                      >
                        Saving will log every user out.
                      </p>
                    )}
                    {isJwt && supportsStrictRevocation && (
                      <div className={'flex flex-col gap-2'}>
                        <SwitchField
                          label={'Strict revocation'}
                          fieldName={'accessTokens.strictRevocation'}
                          disabled={!edit}
                        />
                        <p className={'text-xs text-muted-foreground'}>
                          Check the session registry on every request so logout
                          and blocks take effect immediately, at the cost of one
                          Redis read per request.
                        </p>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
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
                  {isJwt ? (
                    <div className={'flex flex-row space-x-4 items-end'}>
                      <div className={'flex w-full flex-col gap-1.5'}>
                        <SelectField
                          label={'Expiry Period'}
                          triggerId={'jwt-expiry-period'}
                          triggerProps={{
                            'aria-invalid': Boolean(expiryError),
                            'aria-describedby': expiryError
                              ? 'jwt-expiry-error'
                              : undefined,
                          }}
                          options={
                            jwtExpiryKnown || typeof expiryMs !== 'number'
                              ? JWT_EXPIRY_OPTIONS
                              : [
                                  ...JWT_EXPIRY_OPTIONS,
                                  {
                                    label: `Custom (${expiryMs / 1000} s)`,
                                    value: 'custom',
                                  },
                                ]
                          }
                          value={
                            jwtExpiryKnown
                              ? String((expiryMs as number) / MINUTE_MS)
                              : typeof expiryMs === 'number'
                                ? 'custom'
                                : undefined
                          }
                          onValueChange={value => {
                            if (value === 'custom') return;
                            form.setValue(
                              'accessTokens.expiryPeriod',
                              Number(value) * MINUTE_MS,
                              { shouldDirty: true, shouldValidate: true }
                            );
                          }}
                          disabled={!edit}
                        />
                        {expiryError && (
                          <p
                            id="jwt-expiry-error"
                            role="alert"
                            className={'text-xs text-destructive'}
                          >
                            {expiryError}
                          </p>
                        )}
                      </div>
                      <div className={'flex w-full flex-col gap-1.5'}>
                        <Label id="signing-kid-label">Signing key id</Label>
                        <div className={'flex flex-row items-center gap-2'}>
                          <code
                            role="textbox"
                            aria-readonly="true"
                            aria-labelledby="signing-kid-label"
                            data-testid="signing-kid"
                            className={
                              'grow rounded-md border bg-muted/30 px-3 py-2 text-sm truncate'
                            }
                          >
                            {signingKid || '-'}
                          </code>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={rotating || savedMode !== 'jwt'}
                              >
                                Rotate signing key
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Rotate signing key?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  New tokens are signed with a new key. Tokens
                                  signed with the current key keep verifying
                                  until they expire.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onRotate}>
                                  Rotate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        {savedMode !== 'jwt' && (
                          <p className={'text-xs text-muted-foreground'}>
                            A signing key is generated when you save JWT mode.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className={'flex flex-row space-x-4'}>
                      <InputField
                        label={'JWT Secret'}
                        fieldName={'accessTokens.jwtSecret'}
                        defaultValue={''}
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
                  )}
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
                    {supportsExtendable && (
                      <SwitchField
                        label={'Allow extension'}
                        fieldName={'refreshTokens.extendable'}
                        disabled={!edit}
                      />
                    )}
                    {supportsMaxLifetime && (
                      <div className={'flex flex-col gap-1'}>
                        <InputField
                          type={'number'}
                          label={'Max lifetime (ms)'}
                          fieldName={'refreshTokens.maxLifetime'}
                          onChange={e => {
                            form.setValue(
                              'refreshTokens.maxLifetime',
                              // A cleared field yields NaN: fall back to the default.
                              Number.isFinite(e.target.valueAsNumber)
                                ? Math.trunc(e.target.valueAsNumber)
                                : DEFAULT_REFRESH_MAX_LIFETIME_MS,
                              { shouldDirty: true }
                            );
                          }}
                          disabled={!edit}
                        />
                        <p className={'text-xs text-muted-foreground pl-1'}>
                          {maxLifetimeText && `= ${maxLifetimeText}`}
                        </p>
                      </div>
                    )}
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
                    {supportsRealms && (
                      <>
                        <h1 className="text-xl font-medium pt-2">Realms</h1>
                        <p className="text-sm text-muted-foreground">
                          Realms turn top-level teams into separate identity
                          domains, each with its own sign-in methods and
                          policies. Turning this off hides realm management but
                          does not remove existing realms.
                        </p>
                        <div className={'grid grid-cols-2 gap-4 items-center'}>
                          <SwitchField
                            label={'Enabled'}
                            fieldName={'teams.realms.enabled'}
                            disabled={!edit}
                          />
                        </div>
                        {form.watch('teams.realms.enabled') && (
                          <div className={'flex flex-col gap-4'}>
                            {supportsIdentityMode && (
                              <div className={'flex flex-col gap-2'}>
                                <SelectField
                                  label={'Identity mode'}
                                  fieldName={'teams.realms.identityMode'}
                                  placeholder={'Shared'}
                                  options={[
                                    {
                                      label:
                                        'Shared: one account per person across realms',
                                      value: 'shared',
                                    },
                                    {
                                      label:
                                        'Isolated: each realm has its own accounts',
                                      value: 'isolated',
                                    },
                                  ]}
                                  disabled={!edit}
                                />
                                <p className={'text-xs text-muted-foreground'}>
                                  {form.watch('teams.realms.identityMode') ===
                                  'isolated'
                                    ? 'Each realm has its own accounts. The same email or phone can exist once per realm, each with its own password. Switching back to shared is refused while any identifier is held twice.'
                                    : 'One account per person across realms. An email or phone can exist only once in the deployment, and people join other realms by connecting their account.'}
                                </p>
                              </div>
                            )}
                            {supportsDiscoveryLogin && (
                              <SwitchField
                                label={'Discovery login'}
                                fieldName={'teams.realms.discoveryLogin'}
                                checked={
                                  form.watch('teams.realms.discoveryLogin') ===
                                  true
                                }
                                disabled={!edit}
                              />
                            )}
                            <div
                              className={'grid grid-cols-2 gap-4 items-start'}
                            >
                              <SwitchField
                                label={'Allow email discovery'}
                                fieldName={'teams.realms.allowEmailDiscovery'}
                                disabled={!edit}
                              />
                              <InputField
                                type={'number'}
                                label={'Cache TTL (ms)'}
                                fieldName={'teams.realms.cacheTtlMs'}
                                description={
                                  'How long realm settings are cached before being re-read.'
                                }
                                min={0}
                                onChange={e => {
                                  form.setValue(
                                    'teams.realms.cacheTtlMs',
                                    // A cleared field yields NaN: fall back to the default.
                                    Number.isFinite(e.target.valueAsNumber)
                                      ? Math.max(
                                          0,
                                          Math.trunc(e.target.valueAsNumber)
                                        )
                                      : DEFAULT_REALM_CACHE_TTL_MS,
                                    { shouldDirty: true }
                                  );
                                }}
                                disabled={!edit}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}
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
                  Applies when an email is accepted (registration, email change,
                  invites). Existing users can still log in.{' '}
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
