'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { SecretTextarea } from '@/components/ui/secret-textarea';
import { RealmSwitchRow } from '@/components/authentication/teams/manageTeam/realm/RealmSwitchRow';
import { hasOwnCredentials } from '@/lib/authentication/realms';
import {
  isCredentialDraftIncomplete,
  type OAuthCredentialDraft,
  type OAuthCredentialErrors,
  type OAuthCredentialMode,
} from '@/lib/authentication/realmCredentials';
import type { OAuthProviderKey, RealmOAuthStrategy } from '@/lib/models/Realm';

/** Shown in the secret input when the server holds a value. Never a real secret. */
export const SECRET_SET_PLACEHOLDER = '•••••• (set)';

const MODES: ReadonlyArray<{ value: OAuthCredentialMode; label: string }> = [
  { value: 'inherit', label: 'Inherit global' },
  { value: 'own', label: 'Own credentials' },
];

function ModeBadge({
  mode,
  incomplete,
}: Readonly<{ mode: OAuthCredentialMode; incomplete: boolean }>) {
  if (incomplete) {
    return (
      <Badge variant="outline" className="shrink-0 font-normal">
        Incomplete
      </Badge>
    );
  }
  if (mode === 'own') {
    return (
      <Badge variant="secondary" className="shrink-0 font-normal">
        Own credentials
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="shrink-0 font-normal text-muted-foreground"
    >
      Inherits global
    </Badge>
  );
}

function SetBadge() {
  return (
    <Badge variant="secondary" className="font-normal">
      set
    </Badge>
  );
}

function Field({
  id,
  label,
  error,
  badge,
  children,
}: Readonly<{
  id: string;
  label: string;
  error?: string;
  badge?: ReactNode;
  children: ReactNode;
}>) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-xs font-medium">
          {label}
        </Label>
        {badge}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Per-realm OAuth credentials of one provider row: a disclosure with an Inherit global /
 * Own credentials choice. Own mode reveals the credential fields. Secrets are write-only:
 * an empty secret input means "keep", and the stored value is never rendered (only a
 * "set" placeholder driven by the masked `has*` flags).
 */
export function OAuthCredentialsBlock({
  provider,
  draft,
  server,
  errors,
  showErrors,
  disabled,
  onChange,
}: Readonly<{
  provider: OAuthProviderKey;
  draft: OAuthCredentialDraft;
  /** Masked server row; only its `has*` flags are used. */
  server: RealmOAuthStrategy | undefined;
  errors?: OAuthCredentialErrors;
  /** Reveal validation messages (after a save attempt). */
  showErrors: boolean;
  disabled?: boolean;
  onChange: (patch: Partial<OAuthCredentialDraft>) => void;
}>) {
  const [open, setOpen] = useState(false);
  const idBase = `realm-oauth-${provider}`;
  const isApple = provider === 'apple';
  const incomplete = isCredentialDraftIncomplete(provider, draft, server);
  const visibleErrors = showErrors ? errors : undefined;
  const hasVisibleErrors =
    draft.mode === 'own' && Object.keys(visibleErrors ?? {}).length > 0;

  useEffect(() => {
    if (hasVisibleErrors) setOpen(true);
  }, [hasVisibleErrors]);

  const invalid = (field: keyof OAuthCredentialErrors) =>
    visibleErrors?.[field] ? true : undefined;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="mt-1 w-full overflow-hidden rounded-md border"
    >
      <div className="flex items-center gap-2 bg-muted/30 px-3 py-2">
        <CollapsibleTrigger
          className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`${provider} credentials`}
        >
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform ui-open:rotate-180" />
          Credentials
        </CollapsibleTrigger>
        <ModeBadge mode={draft.mode} incomplete={incomplete} />
      </div>
      <CollapsibleContent>
        <div className="flex flex-col gap-3 p-3">
          <div
            role="radiogroup"
            aria-label={`${provider} credentials source`}
            className="flex flex-wrap gap-x-4 gap-y-1"
          >
            {MODES.map(mode => (
              <label
                key={mode.value}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name={`${idBase}-credentials`}
                  value={mode.value}
                  className="accent-primary"
                  checked={draft.mode === mode.value}
                  disabled={disabled}
                  onChange={() => onChange({ mode: mode.value })}
                />
                {mode.label}
              </label>
            ))}
          </div>
          {draft.mode === 'inherit' ? (
            <p className="text-xs text-muted-foreground">
              This realm uses the global {provider} configuration.
              {hasOwnCredentials(server) && (
                <> Saving clears the realm&apos;s own credentials.</>
              )}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <Field
                id={`${idBase}-clientId`}
                label={isApple ? 'Apple app ID' : 'Client ID'}
                error={visibleErrors?.clientId}
              >
                <Input
                  id={`${idBase}-clientId`}
                  value={draft.clientId}
                  disabled={disabled}
                  aria-invalid={invalid('clientId')}
                  onChange={e => onChange({ clientId: e.target.value })}
                />
              </Field>
              <Field
                id={`${idBase}-clientSecret`}
                label="Client secret"
                badge={server?.hasClientSecret ? <SetBadge /> : undefined}
              >
                <PasswordInput
                  id={`${idBase}-clientSecret`}
                  value={draft.clientSecret}
                  disabled={disabled}
                  autoComplete="new-password"
                  placeholder={
                    server?.hasClientSecret ? SECRET_SET_PLACEHOLDER : ''
                  }
                  onChange={e => onChange({ clientSecret: e.target.value })}
                />
              </Field>
              <Field
                id={`${idBase}-redirect_uri`}
                label="Redirect URI"
                error={visibleErrors?.redirect_uri}
              >
                <Input
                  id={`${idBase}-redirect_uri`}
                  value={draft.redirect_uri}
                  disabled={disabled}
                  aria-invalid={invalid('redirect_uri')}
                  onChange={e => onChange({ redirect_uri: e.target.value })}
                />
              </Field>
              {isApple && (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field
                      id={`${idBase}-teamId`}
                      label="Team ID"
                      error={visibleErrors?.teamId}
                    >
                      <Input
                        id={`${idBase}-teamId`}
                        value={draft.teamId}
                        disabled={disabled}
                        aria-invalid={invalid('teamId')}
                        onChange={e => onChange({ teamId: e.target.value })}
                      />
                    </Field>
                    <Field
                      id={`${idBase}-keyId`}
                      label="Private key ID"
                      error={visibleErrors?.keyId}
                    >
                      <Input
                        id={`${idBase}-keyId`}
                        value={draft.keyId}
                        disabled={disabled}
                        aria-invalid={invalid('keyId')}
                        onChange={e => onChange({ keyId: e.target.value })}
                      />
                    </Field>
                  </div>
                  <Field
                    id={`${idBase}-privateKey`}
                    label="Private key"
                    error={visibleErrors?.privateKey}
                    badge={server?.hasPrivateKey ? <SetBadge /> : undefined}
                  >
                    <SecretTextarea
                      id={`${idBase}-privateKey`}
                      value={draft.privateKey}
                      disabled={disabled}
                      aria-invalid={invalid('privateKey')}
                      placeholder={
                        server?.hasPrivateKey
                          ? `${SECRET_SET_PLACEHOLDER}. Paste a new key to replace it.`
                          : ''
                      }
                      onChange={e => onChange({ privateKey: e.target.value })}
                    />
                  </Field>
                </>
              )}
              <RealmSwitchRow
                id={`${idBase}-accountLinking`}
                label="Account linking"
                description="Link sign-ins to an existing account with the same email."
                checked={draft.accountLinking}
                disabled={disabled}
                onCheckedChange={checked =>
                  onChange({ accountLinking: checked })
                }
              />
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
