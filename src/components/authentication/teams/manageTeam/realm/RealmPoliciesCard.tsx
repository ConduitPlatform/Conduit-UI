'use client';
import { useEffect, useMemo, useState } from 'react';
import { formatDuration } from '@/lib/authentication/formatDuration';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { UrlTagInput } from '@/components/ui/form-inputs/TagInputField';
import { useSettingsSave } from '@/lib/hooks/use-settings-save';
import { rhfZodResolver } from '@/lib/zod-form';
import { unwrapActionResult } from '@/lib/api/action-result';
import { getRealms, updateRealm } from '@/lib/api/authentication';
import { MAX_REALMS_IN_FILTERS } from '@/lib/authentication/realmMembers';
import {
  buildRealmPoliciesPatch,
  REALM_SIGN_UP_DESCRIPTION,
  realmPoliciesFormSchema,
  toRealmPoliciesFormValues,
  type RealmPoliciesFormValues,
} from '@/lib/authentication/realms';
import type { Realm } from '@/lib/models/Realm';
import { RealmSwitchRow } from '@/components/authentication/teams/manageTeam/realm/RealmSwitchRow';
import {
  TrustedRealmsSelect,
  type RealmOption,
} from '@/components/authentication/teams/manageTeam/realm/TrustedRealmsSelect';

/**
 * A number override that can be handed back to the global value (`null`). Only the
 * Inherit checkbox sets `null`; the typed text is held locally, so clearing the input
 * while typing never flips the field to inherit. An empty or invalid text is `NaN`,
 * which the form schema rejects with a message.
 */
function InheritableNumberField({
  id,
  label,
  description,
  value,
  onChange,
  error,
  disabled,
}: Readonly<{
  id: string;
  label: string;
  description: string;
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
  disabled?: boolean;
}>) {
  const inherited = value === null;
  const [text, setText] = useState(
    value === null || Number.isNaN(value) ? '' : String(value)
  );
  // Follow outside changes (reset, save) without fighting the user's typing.
  useEffect(() => {
    if (value === null) setText('');
    else if (!Number.isNaN(value)) {
      setText(current => (Number(current) === value ? current : String(value)));
    }
  }, [value]);
  const duration = inherited ? '' : formatDuration(value);
  const describedBy = [`${id}-description`, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ');
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="flex flex-row flex-wrap items-center gap-3">
        <Input
          id={id}
          type="number"
          className="max-w-48"
          placeholder={inherited ? 'Inherited' : undefined}
          value={inherited ? '' : text}
          disabled={disabled || inherited}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={e => {
            setText(e.target.value);
            const next = e.target.valueAsNumber;
            onChange(Number.isFinite(next) ? Math.trunc(next) : Number.NaN);
          }}
        />
        {duration && (
          <span className="text-xs text-muted-foreground">= {duration}</span>
        )}
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${id}-inherit`}
            aria-label={`Inherit ${label}`}
            checked={inherited}
            disabled={disabled}
            onCheckedChange={checked =>
              // Unchecking needs a concrete number to edit: start from a day.
              onChange(checked === true ? null : 86_400_000)
            }
          />
          <Label htmlFor={`${id}-inherit`} className="text-sm">
            Inherit
          </Label>
        </div>
      </div>
      <p id={`${id}-description`} className="text-xs text-muted-foreground">
        {description}
      </p>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

const EXTENDABLE_OPTIONS = [
  { value: 'inherit', label: 'Inherit' },
  { value: 'allowed', label: 'Allowed' },
  { value: 'disabled', label: 'Disabled' },
];

/**
 * Policies: apply to EVERY session entering the realm, home users and guests alike.
 */
export function RealmPoliciesCard({
  realm,
  onChange,
}: Readonly<{
  realm: Realm;
  onChange: (realm: Realm) => void;
}>) {
  const { save, isSaving } = useSettingsSave('Realm policies');
  const [realmOptions, setRealmOptions] = useState<RealmOption[]>([]);
  const [loadingRealms, setLoadingRealms] = useState(true);
  // Backends that predate account linking do not report these keys: their switches are
  // not rendered, and the keys are left out of the PATCH.
  const supportsLinking = realm.settings.linking !== undefined;
  // Backends that predate configurable refresh tokens omit `policies.session`.
  const supportsSession = realm.settings.policies.session !== undefined;
  const supportsDirectSignIn =
    realm.settings.policies.guests.directSignIn !== undefined;

  // Policies, sign-up and linking are saved together, so all three are part of the form's
  // baseline.
  const savedKey = JSON.stringify({
    policies: realm.settings.policies,
    registration: realm.settings.registration,
    linking: realm.settings.linking,
  });
  const defaults = useMemo(
    () =>
      toRealmPoliciesFormValues(
        JSON.parse(savedKey) as Pick<
          Realm['settings'],
          'policies' | 'registration' | 'linking'
        >
      ),
    [savedKey]
  );

  const form = useForm<RealmPoliciesFormValues>({
    resolver: rhfZodResolver(realmPoliciesFormSchema),
    defaultValues: defaults,
  });
  const { control, reset, watch, handleSubmit, formState } = form;

  // Follow the server state after a save or refresh, but only when this card's own
  // slice changed: a save from the identity card must not discard unsaved edits here.
  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  useEffect(() => {
    let cancelled = false;
    getRealms(0, MAX_REALMS_IN_FILTERS)
      .then(({ realms }) => {
        if (cancelled) return;
        setRealmOptions(
          realms
            .filter(r => r.team._id !== realm.team._id)
            .map(r => ({
              id: r.team._id,
              slug: r.team.realm?.slug ?? r.team._id,
              name: r.team.name,
            }))
        );
      })
      .catch(() => {
        // The picker degrades to showing raw ids for the already-selected realms.
      })
      .finally(() => {
        if (!cancelled) setLoadingRealms(false);
      });
    return () => {
      cancelled = true;
    };
  }, [realm.team._id]);

  const guestsAllowed = watch('guests.allowed');

  const onSubmit = async (values: RealmPoliciesFormValues) => {
    // One PATCH: `policies`, `registration` and `linking` travel together.
    const body = buildRealmPoliciesPatch(values);
    const result = await save({
      successMessage: 'Realm policies saved',
      action: async () =>
        unwrapActionResult(await updateRealm(realm.team._id, body)),
    });
    if (result.ok) {
      onChange(result.result);
      reset(toRealmPoliciesFormValues(result.result.settings));
    }
  };

  const busy = isSaving;

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Policies</CardTitle>
            <CardDescription>
              Apply to everyone entering this realm, home users and guests
              alike.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Controller
              control={control}
              name="requireTwoFa"
              render={({ field }) => (
                <RealmSwitchRow
                  id="realm-policy-2fa"
                  label="Require 2FA"
                  description="Users without two-factor authentication are asked to enroll before entering."
                  checked={field.value}
                  disabled={busy}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="requireVerifiedEmail"
              render={({ field }) => (
                <RealmSwitchRow
                  id="realm-policy-verified-email"
                  label="Require verified email"
                  description="Users with an unverified email cannot enter."
                  checked={field.value}
                  disabled={busy}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Separator />
            <UrlTagInput
              name="allowedClientIds"
              label="Allowed client ids"
              description="Only these clients can sign in to this realm. Leave empty to allow any client."
              placeholder="Type a client id and press Enter..."
              disabled={busy}
            />
            <Separator />
            <Controller
              control={control}
              name="guests.allowed"
              render={({ field }) => (
                <RealmSwitchRow
                  id="realm-policy-guests"
                  label="Allow guests"
                  description="Users whose home is elsewhere can be added as guests. Off makes this a strict realm: home users only."
                  checked={field.value}
                  disabled={busy}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Trusted home realms</Label>
              <p className="text-xs text-muted-foreground">
                {guestsAllowed
                  ? 'Only guests whose home is one of these realms can enter. Leave empty to accept any home realm, including global users.'
                  : 'Not used while guests are not allowed.'}
              </p>
              <Controller
                control={control}
                name="guests.allowedHomeRealms"
                render={({ field }) => (
                  <TrustedRealmsSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={realmOptions}
                    loading={loadingRealms}
                    disabled={busy || !guestsAllowed}
                  />
                )}
              />
            </div>
            <Separator />
            <section
              className="flex flex-col gap-3"
              aria-labelledby="realm-policy-sign-up"
            >
              <h3 id="realm-policy-sign-up" className="text-sm font-medium">
                Sign-up
              </h3>
              <Controller
                control={control}
                name="registration.allowWithoutInvite"
                render={({ field }) => (
                  <RealmSwitchRow
                    id="realm-registration-allow-without-invite"
                    label="Allow sign-up without an invite"
                    description={REALM_SIGN_UP_DESCRIPTION}
                    checked={field.value === true}
                    disabled={busy}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </section>
            {supportsSession && (
              <>
                <Separator />
                <section
                  className="flex flex-col gap-3"
                  aria-labelledby="realm-policy-session"
                >
                  <div className="flex flex-col gap-0.5">
                    <h3
                      id="realm-policy-session"
                      className="text-sm font-medium"
                    >
                      Session
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Refresh token overrides for this realm. Realm values can
                      only tighten the global ones: a shorter expiry, a lower
                      lifetime cap, or extension turned off. Unticking Inherit
                      starts from one day; set a value below the global one.
                    </p>
                  </div>
                  <Controller
                    control={control}
                    name="session.refreshTokens.expiryPeriod"
                    render={({ field, fieldState }) => (
                      <InheritableNumberField
                        id="realm-session-expiry"
                        label="Refresh token expiry (ms)"
                        description="Inherit uses the global refresh token expiry."
                        value={field.value ?? null}
                        disabled={busy}
                        error={fieldState.error?.message}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="session.refreshTokens.maxLifetime"
                    render={({ field, fieldState }) => (
                      <InheritableNumberField
                        id="realm-session-max-lifetime"
                        label="Max lifetime (ms)"
                        description="Inherit uses the global maximum lifetime."
                        value={field.value ?? null}
                        disabled={busy}
                        error={fieldState.error?.message}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="session.refreshTokens.extendable"
                    render={({ field }) => (
                      <div className="flex flex-col gap-1.5">
                        <Label
                          id="realm-session-extendable-label"
                          className="text-sm font-medium"
                        >
                          Extension allowed
                        </Label>
                        <Select
                          value={
                            field.value === null || field.value === undefined
                              ? 'inherit'
                              : field.value
                                ? 'allowed'
                                : 'disabled'
                          }
                          onValueChange={value =>
                            field.onChange(
                              value === 'inherit' ? null : value === 'allowed'
                            )
                          }
                          disabled={busy}
                        >
                          <SelectTrigger
                            className="max-w-48"
                            aria-labelledby="realm-session-extendable-label"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            {EXTENDABLE_OPTIONS.map(option => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Whether refreshing extends the refresh token. A realm
                          can disable extension but cannot enable it when the
                          global setting has it off.
                        </p>
                      </div>
                    )}
                  />
                </section>
              </>
            )}
            {(supportsLinking || supportsDirectSignIn) && (
              <>
                <Separator />
                <section
                  className="flex flex-col gap-3"
                  aria-labelledby="realm-policy-linking"
                >
                  <div className="flex flex-col gap-0.5">
                    <h3
                      id="realm-policy-linking"
                      className="text-sm font-medium"
                    >
                      Linking
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Connected accounts link a user&apos;s account in one realm
                      to another realm, so they can sign in there with their own
                      credentials.
                    </p>
                  </div>
                  {supportsLinking && (
                    <>
                      <Controller
                        control={control}
                        name="linking.inbound"
                        render={({ field }) => (
                          <RealmSwitchRow
                            id="realm-linking-inbound"
                            label="Accept connected accounts from other realms"
                            description="Users with an account in another realm can connect it to this realm."
                            checked={field.value === true}
                            disabled={busy}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name="linking.outbound"
                        render={({ field }) => (
                          <RealmSwitchRow
                            id="realm-linking-outbound"
                            label="Let this realm's accounts connect to other realms"
                            description="Users of this realm can connect their account to another realm that accepts it."
                            checked={field.value === true}
                            disabled={busy}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </>
                  )}
                  {supportsDirectSignIn && (
                    <Controller
                      control={control}
                      name="guests.directSignIn"
                      render={({ field }) => (
                        <RealmSwitchRow
                          id="realm-policy-direct-sign-in"
                          label="Connected accounts can sign in here directly"
                          description="Linked guests sign in to this realm with their own account and password, without going through their home realm."
                          checked={field.value === true}
                          disabled={busy}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  )}
                </section>
              </>
            )}
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={!formState.isDirty || busy}
              onClick={() => reset(defaults)}
            >
              Reset
            </Button>
            <Button type="submit" disabled={!formState.isDirty || busy}>
              Save changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
