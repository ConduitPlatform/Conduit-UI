import { describe, expect, it } from 'vitest';
import {
  buildIdentityPatch,
  credentialDraftFromStrategy,
  credentialDraftsFromStrategies,
  isCredentialDraftIncomplete,
  validateCredentialDraft,
  validateIdentityCredentials,
  type OAuthCredentialDraft,
} from '@/lib/authentication/realmCredentials';
import { strategiesToIdentityValues } from '@/lib/authentication/realms';
import type { RealmStrategies } from '@/lib/models/Realm';

const strategies = (oauth: RealmStrategies['oauth']): RealmStrategies => ({
  local: { enabled: true },
  username: { enabled: false },
  magicLink: { enabled: false },
  phone: { enabled: false },
  metamask: { enabled: false },
  biometric: { enabled: false },
  oauth,
});

const CLEARED = {
  clientId: null,
  clientSecret: null,
  redirect_uri: null,
  privateKey: null,
  teamId: null,
  keyId: null,
};

const own = (
  patch: Partial<OAuthCredentialDraft> = {}
): OAuthCredentialDraft => ({
  ...credentialDraftFromStrategy(undefined),
  mode: 'own',
  ...patch,
});

/** Own mode with a client ID and the secret already stored (the non-Apple baseline). */
const SECRET_SET = { hasClientSecret: true } as const;

/** Patch for editing `draft` of `provider` against `current`, nothing else changed. */
const patchFor = (
  current: RealmStrategies,
  provider: 'google' | 'apple',
  draft: OAuthCredentialDraft
) => {
  const drafts = credentialDraftsFromStrategies(current);
  drafts[provider] = draft;
  return buildIdentityPatch(
    current,
    strategiesToIdentityValues(current),
    drafts
  );
};

describe('credentialDraftFromStrategy', () => {
  it('is inherit for a missing or empty row', () => {
    expect(credentialDraftFromStrategy(undefined).mode).toBe('inherit');
    expect(credentialDraftFromStrategy({ enabled: true }).mode).toBe('inherit');
    expect(
      credentialDraftFromStrategy({ enabled: true, clientId: '  ' }).mode
    ).toBe('inherit');
  });

  it.each([
    { enabled: true, clientId: 'id' },
    { enabled: true, hasClientSecret: true },
    { enabled: true, redirect_uri: 'https://x.test/cb' },
    { enabled: true, accountLinking: false },
    { enabled: true, accountLinking: true },
  ])('is own for %o', row => {
    expect(credentialDraftFromStrategy(row).mode).toBe('own');
  });

  it('keeps account linking undefined (inherit) unless the row stores a boolean', () => {
    expect(
      credentialDraftFromStrategy(undefined).accountLinking
    ).toBeUndefined();
    expect(
      credentialDraftFromStrategy({ enabled: true, clientId: 'id' })
        .accountLinking
    ).toBeUndefined();
    expect(
      credentialDraftFromStrategy({ enabled: true, accountLinking: false })
        .accountLinking
    ).toBe(false);
  });

  it('never carries secrets or has* flags into the draft', () => {
    const draft = credentialDraftFromStrategy({
      enabled: true,
      clientId: 'id',
      hasClientSecret: true,
      hasPrivateKey: true,
      clientSecret: 'leak',
      privateKey: 'leak',
    });
    expect(draft.clientSecret).toBe('');
    expect(draft.privateKey).toBe('');
    expect(Object.keys(draft).join()).not.toMatch(/has/);
  });
});

describe('validateCredentialDraft', () => {
  it('has nothing to validate in inherit mode', () => {
    expect(
      validateCredentialDraft('google', {
        ...own(),
        mode: 'inherit',
        redirect_uri: 'nope',
      })
    ).toEqual({});
  });

  it('requires a client ID in own mode', () => {
    expect(validateCredentialDraft('google', own(), SECRET_SET)).toEqual({
      clientId: 'Client ID is required',
    });
    expect(
      validateCredentialDraft('google', own({ clientId: '   ' }), SECRET_SET)
        .clientId
    ).toBeDefined();
    expect(
      validateCredentialDraft('google', own({ clientId: 'id' }), SECRET_SET)
    ).toEqual({});
  });

  it('requires redirect_uri to be a URL when present', () => {
    expect(
      validateCredentialDraft(
        'google',
        own({ clientId: 'id', redirect_uri: 'nope' }),
        SECRET_SET
      ).redirect_uri
    ).toBe('Must be a valid URL');
    expect(
      validateCredentialDraft(
        'google',
        own({ clientId: 'id', redirect_uri: 'https://x.test/cb' }),
        SECRET_SET
      )
    ).toEqual({});
  });

  describe('client secret', () => {
    it('is required for a non-Apple provider unless one is stored', () => {
      expect(
        validateCredentialDraft('google', own({ clientId: 'id' }))
      ).toEqual({ clientSecret: 'Client secret is required' });
      expect(
        validateCredentialDraft('google', own({ clientId: 'id' }), {
          hasClientSecret: false,
        }).clientSecret
      ).toBeDefined();
      expect(
        validateCredentialDraft('google', own({ clientId: 'id' }), SECRET_SET)
      ).toEqual({});
    });

    it('is satisfied by a typed secret', () => {
      expect(
        validateCredentialDraft(
          'github',
          own({ clientId: 'id', clientSecret: 's3cr3t' })
        )
      ).toEqual({});
      expect(
        validateCredentialDraft(
          'github',
          own({ clientId: 'id', clientSecret: '   ' })
        ).clientSecret
      ).toBeDefined();
    });

    it('is never required for Apple', () => {
      expect(
        validateCredentialDraft('apple', own({ clientId: 'app' }))
      ).toEqual({});
    });
  });

  it.each([
    [{ teamId: 'T' }, ['keyId', 'privateKey']],
    [{ teamId: 'T', keyId: 'K' }, ['privateKey']],
    [{ privateKey: 'P' }, ['teamId', 'keyId']],
  ])('rejects a partial Apple key set %o', (fields, missing) => {
    const errors = validateCredentialDraft(
      'apple',
      own({ clientId: 'id', ...fields })
    );
    expect(Object.keys(errors).sort()).toEqual([...missing].sort());
  });

  it('accepts Apple key fields all set or all empty', () => {
    expect(
      validateCredentialDraft(
        'apple',
        own({ clientId: 'id', teamId: 'T', keyId: 'K', privateKey: 'P' })
      )
    ).toEqual({});
    expect(validateCredentialDraft('apple', own({ clientId: 'id' }))).toEqual(
      {}
    );
  });

  it('counts a stored private key as set', () => {
    expect(
      validateCredentialDraft(
        'apple',
        own({ clientId: 'id', teamId: 'T', keyId: 'K' }),
        { hasPrivateKey: true }
      )
    ).toEqual({});
    expect(
      validateCredentialDraft('apple', own({ clientId: 'id', keyId: 'K' }), {
        hasPrivateKey: true,
      }).teamId
    ).toBeDefined();
  });

  it('treats emptied team ID and key ID without a typed key as the global Apple key', () => {
    // A stored private key must not make the cleared set a partial one.
    expect(
      validateCredentialDraft('apple', own({ clientId: 'id' }), {
        hasPrivateKey: true,
      })
    ).toEqual({});
  });

  it('still blocks clearing only one of the team ID and key ID', () => {
    const errors = validateCredentialDraft(
      'apple',
      own({ clientId: 'id', keyId: 'K' }),
      { hasPrivateKey: true }
    );
    expect(Object.keys(errors)).toEqual(['teamId']);
    expect(
      validateCredentialDraft('apple', own({ clientId: 'id', teamId: 'T' }), {
        hasPrivateKey: true,
      }).keyId
    ).toBeDefined();
  });

  it('blocks a typed private key without its ids', () => {
    expect(
      Object.keys(
        validateCredentialDraft(
          'apple',
          own({ clientId: 'id', privateKey: 'P' })
        )
      ).sort()
    ).toEqual(['keyId', 'teamId']);
  });

  it('does not apply the Apple rule to other providers', () => {
    expect(
      validateCredentialDraft(
        'google',
        own({ clientId: 'id', teamId: 'T' }),
        SECRET_SET
      )
    ).toEqual({});
  });
});

describe('isCredentialDraftIncomplete', () => {
  it('is true for own mode without a client ID or secret, or with partial Apple keys', () => {
    expect(isCredentialDraftIncomplete('google', own())).toBe(true);
    expect(isCredentialDraftIncomplete('google', own({ clientId: 'i' }))).toBe(
      true
    );
    expect(
      isCredentialDraftIncomplete('apple', own({ clientId: 'i', teamId: 'T' }))
    ).toBe(true);
  });

  it('is false for inherit, complete own, and a malformed redirect URI', () => {
    expect(
      isCredentialDraftIncomplete('google', { ...own(), mode: 'inherit' })
    ).toBe(false);
    expect(
      isCredentialDraftIncomplete('google', own({ clientId: 'i' }), SECRET_SET)
    ).toBe(false);
    expect(
      isCredentialDraftIncomplete(
        'google',
        own({ clientId: 'i', redirect_uri: 'bad' }),
        SECRET_SET
      )
    ).toBe(false);
  });
});

describe('validateIdentityCredentials', () => {
  it('ignores disabled providers and untouched rows', () => {
    const current = strategies({
      google: { enabled: true, hasClientSecret: true },
      github: { enabled: false },
    });
    const values = strategiesToIdentityValues(current);
    const drafts = credentialDraftsFromStrategies(current);
    expect(validateIdentityCredentials(current, values, drafts)).toEqual({});

    drafts.github = own({ redirect_uri: 'bad' });
    expect(validateIdentityCredentials(current, values, drafts)).toEqual({});

    drafts.google = { ...drafts.google, redirect_uri: 'bad' };
    expect(
      Object.keys(validateIdentityCredentials(current, values, drafts))
    ).toEqual(['google']);
  });
});

describe('buildIdentityPatch: the three transitions', () => {
  it('inherit -> own sends only the typed, trimmed fields', () => {
    const current = strategies({ google: { enabled: true } });
    expect(
      patchFor(
        current,
        'google',
        own({ clientId: ' id ', clientSecret: 'sec', redirect_uri: '' })
      )
    ).toEqual({ oauth: { google: { clientId: 'id', clientSecret: 'sec' } } });
  });

  it('own -> inherit sends the six nulls', () => {
    const current = strategies({
      google: { enabled: true, clientId: 'id', hasClientSecret: true },
    });
    const draft = {
      ...credentialDraftFromStrategy(current.oauth.google),
      mode: 'inherit' as const,
    };
    expect(patchFor(current, 'google', draft)).toEqual({
      oauth: { google: CLEARED },
    });
  });

  it('own -> inherit also resets a stored account linking override', () => {
    const current = strategies({
      google: {
        enabled: true,
        clientId: 'id',
        hasClientSecret: true,
        accountLinking: false,
      },
    });
    const draft = {
      ...credentialDraftFromStrategy(current.oauth.google),
      mode: 'inherit' as const,
    };
    expect(patchFor(current, 'google', draft)).toEqual({
      oauth: { google: { ...CLEARED, accountLinking: null } },
    });
  });

  it('inherit after an account-linking-only override sends only accountLinking: null', () => {
    const current = strategies({
      google: { enabled: true, accountLinking: true },
    });
    const draft = credentialDraftFromStrategy(current.oauth.google);
    expect(draft.mode).toBe('own');
    expect(patchFor(current, 'google', { ...draft, mode: 'inherit' })).toEqual({
      oauth: { google: { accountLinking: null } },
    });
  });

  it('own -> inherit omits accountLinking when none is stored', () => {
    const current = strategies({
      google: { enabled: true, clientId: 'id', hasClientSecret: true },
    });
    const draft = {
      ...credentialDraftFromStrategy(current.oauth.google),
      mode: 'inherit' as const,
    };
    expect(patchFor(current, 'google', draft)).toEqual({
      oauth: { google: CLEARED },
    });
  });

  it('own -> inherit sends nothing when the server row has no credentials', () => {
    const current = strategies({ google: { enabled: true } });
    expect(
      patchFor(current, 'google', {
        ...own({ clientId: 'typed' }),
        mode: 'inherit',
      })
    ).toEqual({});
  });

  it('own edit sends only what changed and keeps an untouched secret', () => {
    const current = strategies({
      google: {
        enabled: true,
        clientId: 'id',
        hasClientSecret: true,
        redirect_uri: 'https://x.test/cb',
      },
    });
    const base = credentialDraftFromStrategy(current.oauth.google);
    expect(patchFor(current, 'google', base)).toEqual({});
    expect(patchFor(current, 'google', { ...base, clientId: 'id2' })).toEqual({
      oauth: { google: { clientId: 'id2' } },
    });
    expect(
      patchFor(current, 'google', { ...base, clientSecret: 'new' })
    ).toEqual({ oauth: { google: { clientSecret: 'new' } } });
  });

  it('own edit clears a non-secret field that was emptied with null', () => {
    const current = strategies({
      google: {
        enabled: true,
        clientId: 'id',
        redirect_uri: 'https://x.test/cb',
      },
    });
    const base = credentialDraftFromStrategy(current.oauth.google);
    expect(patchFor(current, 'google', { ...base, redirect_uri: '' })).toEqual({
      oauth: { google: { redirect_uri: null } },
    });
  });

  it('combines enablement with credentials in one row', () => {
    const current = strategies({ google: { enabled: false } });
    const values = strategiesToIdentityValues(current);
    values.oauth.google.enabled = true;
    const drafts = credentialDraftsFromStrategies(current);
    drafts.google = own({ clientId: 'id' });
    expect(buildIdentityPatch(current, values, drafts)).toEqual({
      oauth: { google: { enabled: true, clientId: 'id' } },
    });
  });

  it('never touches the credentials of a disabled provider', () => {
    const current = strategies({
      google: { enabled: true, clientId: 'id', hasClientSecret: true },
    });
    const values = strategiesToIdentityValues(current);
    values.oauth.google.enabled = false;
    const drafts = credentialDraftsFromStrategies(current);
    drafts.google = { ...drafts.google, mode: 'inherit' };
    expect(buildIdentityPatch(current, values, drafts)).toEqual({
      oauth: { google: { enabled: false } },
    });
  });

  it('dropping back to the global Apple key sends teamId, keyId and privateKey as null', () => {
    const current = strategies({
      apple: {
        enabled: true,
        clientId: 'app',
        teamId: 'TEAM123',
        keyId: 'KEY123',
        hasPrivateKey: true,
      },
    });
    const base = credentialDraftFromStrategy(current.oauth.apple);
    expect(
      patchFor(current, 'apple', { ...base, teamId: '', keyId: '' })
    ).toEqual({
      oauth: { apple: { teamId: null, keyId: null, privateKey: null } },
    });
  });

  it('does not clear the Apple key when a private key is typed or only one id is emptied', () => {
    const current = strategies({
      apple: {
        enabled: true,
        clientId: 'app',
        teamId: 'TEAM123',
        keyId: 'KEY123',
        hasPrivateKey: true,
      },
    });
    const base = credentialDraftFromStrategy(current.oauth.apple);
    expect(
      patchFor(current, 'apple', {
        ...base,
        teamId: '',
        keyId: '',
        privateKey: 'NEW',
      })
    ).toEqual({
      oauth: {
        apple: { teamId: null, keyId: null, privateKey: 'NEW' },
      },
    });
    expect(patchFor(current, 'apple', { ...base, teamId: '' })).toEqual({
      oauth: { apple: { teamId: null } },
    });
  });

  it('leaves a stored key alone when the ids were already empty', () => {
    const current = strategies({
      apple: { enabled: true, clientId: 'app', hasPrivateKey: true },
    });
    const base = credentialDraftFromStrategy(current.oauth.apple);
    expect(patchFor(current, 'apple', { ...base, clientId: 'app2' })).toEqual({
      oauth: { apple: { clientId: 'app2' } },
    });
  });

  it('never sends a client secret for Apple', () => {
    const current = strategies({ apple: { enabled: true } });
    expect(patchFor(current, 'apple', own({ clientId: 'app' }))).toEqual({
      oauth: { apple: { clientId: 'app' } },
    });
  });

  it('account linking: boolean overrides, undefined sends null, unchanged sends nothing', () => {
    const inherited = strategies({
      google: { enabled: true, clientId: 'id', hasClientSecret: true },
    });
    const baseInherited = credentialDraftFromStrategy(inherited.oauth.google);
    expect(patchFor(inherited, 'google', baseInherited)).toEqual({});
    expect(
      patchFor(inherited, 'google', { ...baseInherited, accountLinking: false })
    ).toEqual({ oauth: { google: { accountLinking: false } } });

    const overridden = strategies({
      google: {
        enabled: true,
        clientId: 'id',
        hasClientSecret: true,
        accountLinking: false,
      },
    });
    const baseOverridden = credentialDraftFromStrategy(overridden.oauth.google);
    expect(patchFor(overridden, 'google', baseOverridden)).toEqual({});
    expect(
      patchFor(overridden, 'google', {
        ...baseOverridden,
        accountLinking: undefined,
      })
    ).toEqual({ oauth: { google: { accountLinking: null } } });
  });

  it('toggles account linking only when it differs from the read', () => {
    const current = strategies({
      google: { enabled: true, clientId: 'id', accountLinking: false },
    });
    const base = credentialDraftFromStrategy(current.oauth.google);
    expect(
      patchFor(current, 'google', { ...base, accountLinking: true })
    ).toEqual({ oauth: { google: { accountLinking: true } } });
  });
});
