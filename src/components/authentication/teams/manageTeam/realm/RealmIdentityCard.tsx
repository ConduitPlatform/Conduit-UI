'use client';
import { useEffect, useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSettingsSave } from '@/lib/hooks/use-settings-save';
import { rhfZodResolver } from '@/lib/zod-form';
import { unwrapActionResult } from '@/lib/api/action-result';
import { updateRealm } from '@/lib/api/authentication';
import {
  buildStrategiesPatch,
  hasOwnCredentials,
  realmStrategiesSchema,
  strategiesToIdentityValues,
  type RealmIdentityValues,
} from '@/lib/authentication/realms';
import type { Realm, RealmOAuthStrategy } from '@/lib/models/Realm';
import {
  HOME_STRATEGIES,
  OAUTH_PROVIDERS,
} from '@/components/authentication/teams/manageTeam/realm/realmStrategies.config';
import { RealmSwitchRow } from '@/components/authentication/teams/manageTeam/realm/RealmSwitchRow';

/**
 * Identity: how HOME users sign in to this realm. Switches only for now; per-realm
 * credentials are a follow-up (see `OAuthCredentialsSlot`).
 */
export function RealmIdentityCard({
  realm,
  onChange,
}: Readonly<{
  realm: Realm;
  onChange: (realm: Realm) => void;
}>) {
  const { save, isSaving } = useSettingsSave('Realm identity');
  const strategies = realm.settings.strategies;
  const saved = useMemo(
    () => strategiesToIdentityValues(strategies),
    [strategies]
  );

  const form = useForm<RealmIdentityValues>({
    // Validates the switch-only slice against the shared strategies schema.
    resolver: rhfZodResolver(
      realmStrategiesSchema
    ) as unknown as Resolver<RealmIdentityValues>,
    defaultValues: saved,
  });
  const { watch, setValue, reset } = form;

  // Follow the server state after a save or refresh, but only when this card's own
  // slice changed: a save from the policies card must not discard unsaved switches here.
  const savedKey = JSON.stringify(saved);
  useEffect(() => {
    reset(JSON.parse(savedKey) as RealmIdentityValues);
  }, [savedKey, reset]);

  const values = watch();
  const patch = buildStrategiesPatch(strategies, values);
  const isDirty = Object.keys(patch).length > 0;

  const onSave = async () => {
    const result = await save({
      successMessage: 'Realm identity saved',
      action: async () =>
        unwrapActionResult(
          await updateRealm(realm.team._id, { strategies: patch })
        ),
    });
    if (result.ok) onChange(result.result);
  };

  const noMethodEnabled =
    !HOME_STRATEGIES.some(s => values[s.key].enabled) &&
    !OAUTH_PROVIDERS.some(p => values.oauth[p.key].enabled);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identity</CardTitle>
        <CardDescription>
          How home users sign in to this realm. Guests keep using their own home
          realm.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {HOME_STRATEGIES.map(strategy => (
          <div key={strategy.key} className="flex flex-col gap-3">
            <RealmSwitchRow
              id={`realm-strategy-${strategy.key}`}
              label={strategy.name}
              description={strategy.description}
              checked={values[strategy.key].enabled}
              disabled={isSaving}
              onCheckedChange={checked =>
                setValue(`${strategy.key}.enabled`, checked, {
                  shouldDirty: true,
                })
              }
            />
            {strategy.key === 'local' && values.local.enabled && (
              <RealmSwitchRow
                id="realm-strategy-local-verification"
                className="ml-4 border-l pl-4"
                label="Require verification"
                description="New accounts must verify their email before they can sign in."
                checked={values.local.verificationRequired}
                disabled={isSaving}
                onCheckedChange={checked =>
                  setValue('local.verificationRequired', checked, {
                    shouldDirty: true,
                  })
                }
              />
            )}
          </div>
        ))}
        <Separator />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium">Social providers</p>
          <p className="text-xs text-muted-foreground">
            Providers use the global credentials unless the realm has its own.
          </p>
        </div>
        {OAUTH_PROVIDERS.map(provider => (
          <RealmSwitchRow
            key={provider.key}
            id={`realm-oauth-${provider.key}`}
            label={provider.name}
            checked={values.oauth[provider.key].enabled}
            disabled={isSaving}
            onCheckedChange={checked =>
              setValue(`oauth.${provider.key}.enabled`, checked, {
                shouldDirty: true,
              })
            }
          >
            <OAuthCredentialsSlot strategy={strategies.oauth?.[provider.key]} />
          </RealmSwitchRow>
        ))}
        {noMethodEnabled && (
          <p
            role="status"
            className="rounded-md bg-callout-warning-muted px-3 py-2 text-xs text-callout-warning-foreground"
          >
            No sign-in method is enabled. Home users will not be able to sign in
            to this realm.
          </p>
        )}
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          disabled={!isDirty || isSaving}
          onClick={() => reset(saved)}
        >
          Reset
        </Button>
        <Button type="button" disabled={!isDirty || isSaving} onClick={onSave}>
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * EXTENSION POINT (credentials UI, out of scope here).
 * Per-realm OAuth credentials (Inherit global / Own credentials, client id, secret with
 * a "set" badge, redirect URI, Apple key fields) will render in this slot, under the
 * provider's switch. Today it only reports what the masked server read says, and the
 * card patches `enabled` only, so credentials are never touched.
 */
function OAuthCredentialsSlot({
  strategy,
}: Readonly<{ strategy: RealmOAuthStrategy | undefined }>) {
  if (!hasOwnCredentials(strategy)) return null;
  return (
    <p className="text-xs text-muted-foreground">Uses its own credentials</p>
  );
}
