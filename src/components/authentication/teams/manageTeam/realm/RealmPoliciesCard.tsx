'use client';
import { useEffect, useMemo, useState } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { UrlTagInput } from '@/components/ui/form-inputs/TagInputField';
import { useSettingsSave } from '@/lib/hooks/use-settings-save';
import { rhfZodResolver } from '@/lib/zod-form';
import { unwrapActionResult } from '@/lib/api/action-result';
import { getRealms, updateRealm } from '@/lib/api/authentication';
import { MAX_REALMS_IN_FILTERS } from '@/lib/authentication/realmMembers';
import {
  buildRealmPoliciesPatch,
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

  // Policies and linking are saved together, so both are part of the form's baseline.
  const savedKey = JSON.stringify({
    policies: realm.settings.policies,
    linking: realm.settings.linking,
  });
  const defaults = useMemo(
    () =>
      toRealmPoliciesFormValues(
        JSON.parse(savedKey) as Pick<Realm['settings'], 'policies' | 'linking'>
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
    // One PATCH: `policies` and `linking` travel together.
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
              aria-labelledby="realm-policy-linking"
            >
              <div className="flex flex-col gap-0.5">
                <h3 id="realm-policy-linking" className="text-sm font-medium">
                  Linking
                </h3>
                <p className="text-xs text-muted-foreground">
                  Connected accounts link a user&apos;s account in one realm to
                  another realm, so they can sign in there with their own
                  credentials.
                </p>
              </div>
              <Controller
                control={control}
                name="linking.inbound"
                render={({ field }) => (
                  <RealmSwitchRow
                    id="realm-linking-inbound"
                    label="Accept connected accounts from other realms"
                    description="Users with an account in another realm can connect it to this realm."
                    checked={field.value}
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
                    checked={field.value}
                    disabled={busy}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="guests.directSignIn"
                render={({ field }) => (
                  <RealmSwitchRow
                    id="realm-policy-direct-sign-in"
                    label="Connected accounts can sign in here directly"
                    description="Linked guests sign in to this realm with their own account and password, without going through their home realm."
                    checked={field.value}
                    disabled={busy}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </section>
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
