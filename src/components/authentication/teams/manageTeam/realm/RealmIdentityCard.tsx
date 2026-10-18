'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
import { unwrapActionResult } from '@/lib/api/action-result';
import { updateRealm } from '@/lib/api/authentication';
import {
  strategiesToIdentityValues,
  type RealmIdentityValues,
} from '@/lib/authentication/realms';
import {
  buildIdentityPatch,
  credentialDraftsFromStrategies,
  validateIdentityCredentials,
  type OAuthCredentialDraft,
  type OAuthCredentialDrafts,
} from '@/lib/authentication/realmCredentials';
import type {
  OAuthProviderKey,
  Realm,
  RealmStrategies,
} from '@/lib/models/Realm';
import {
  HOME_STRATEGIES,
  OAUTH_PROVIDERS,
} from '@/components/authentication/teams/manageTeam/realm/realmStrategies.config';
import { RealmSwitchRow } from '@/components/authentication/teams/manageTeam/realm/RealmSwitchRow';
import { OAuthCredentialsBlock } from '@/components/authentication/teams/manageTeam/realm/OAuthCredentialsBlock';

/** Switch state plus the editable OAuth credential draft of every provider. */
type IdentityFormValues = RealmIdentityValues & {
  creds: OAuthCredentialDrafts;
};

const toFormValues = (
  strategies: Partial<RealmStrategies> | undefined
): IdentityFormValues => ({
  ...strategiesToIdentityValues(strategies),
  creds: credentialDraftsFromStrategies(strategies),
});

/**
 * Identity: how HOME users sign in to this realm. Switches, plus per-realm OAuth
 * credentials (Inherit global / Own credentials) under each enabled provider.
 */
export function RealmIdentityCard({
  realm,
  globalAccountLinking,
  onChange,
}: Readonly<{
  realm: Realm;
  /**
   * The global `accountLinking` of each OAuth provider: the baseline a realm inherits
   * until it overrides it. Missing providers default to on, as on the backend.
   */
  globalAccountLinking?: Partial<Record<OAuthProviderKey, boolean>>;
  onChange: (realm: Realm) => void;
}>) {
  const router = useRouter();
  const { save, isSaving } = useSettingsSave('Realm identity');
  const [showErrors, setShowErrors] = useState(false);
  const strategies = realm.settings.strategies;
  const saved = useMemo(() => toFormValues(strategies), [strategies]);

  // No resolver: Save validates through `validateIdentityCredentials` and the switches
  // cannot hold an invalid value.
  const form = useForm<IdentityFormValues>({ defaultValues: saved });
  const { watch, setValue, reset } = form;

  // Follow the server state after a save or refresh, but only when this card's own
  // slice changed: a save from the policies card must not discard unsaved switches here.
  const savedKey = JSON.stringify(saved);
  useEffect(() => {
    reset(JSON.parse(savedKey) as IdentityFormValues);
    setShowErrors(false);
  }, [savedKey, reset]);

  const values = watch();
  const patch = buildIdentityPatch(strategies, values, values.creds);
  const isDirty = Object.keys(patch).length > 0;
  const credentialErrors = validateIdentityCredentials(
    strategies,
    values,
    values.creds
  );

  const onSave = async () => {
    if (Object.keys(credentialErrors).length > 0) {
      setShowErrors(true);
      return;
    }
    const result = await save({
      successMessage: 'Realm identity saved',
      action: async () =>
        unwrapActionResult(
          await updateRealm(realm.team._id, { strategies: patch })
        ),
    });
    if (result.ok) {
      onChange(result.result);
      // Re-derive the mode and clear typed secrets from the fresh masked read.
      reset(toFormValues(result.result.settings.strategies));
      setShowErrors(false);
      router.refresh();
    }
  };

  // Typed secrets are write-only and never survive a change of mode or enablement:
  // coming back to a row must not resurrect (or silently resend) a secret.
  const clearTypedSecrets = (provider: OAuthProviderKey) => {
    setValue(`creds.${provider}.clientSecret`, '', { shouldDirty: true });
    setValue(`creds.${provider}.privateKey`, '', { shouldDirty: true });
  };

  const updateCredentials = (
    provider: OAuthProviderKey,
    change: Partial<OAuthCredentialDraft>
  ) => {
    if ('mode' in change) clearTypedSecrets(provider);
    for (const field of Object.keys(change) as Array<
      keyof OAuthCredentialDraft
    >) {
      setValue(`creds.${provider}.${field}`, change[field] as never, {
        shouldDirty: true,
      });
    }
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
            onCheckedChange={checked => {
              clearTypedSecrets(provider.key);
              setValue(`oauth.${provider.key}.enabled`, checked, {
                shouldDirty: true,
              });
            }}
          >
            {values.oauth[provider.key].enabled && (
              <OAuthCredentialsBlock
                provider={provider.key}
                draft={values.creds[provider.key]}
                server={strategies.oauth?.[provider.key]}
                errors={credentialErrors[provider.key]}
                showErrors={showErrors}
                disabled={isSaving}
                globalAccountLinking={globalAccountLinking?.[provider.key]}
                onChange={change => updateCredentials(provider.key, change)}
              />
            )}
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
          onClick={() => {
            reset(saved);
            setShowErrors(false);
          }}
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
