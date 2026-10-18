import { describe, expect, it } from 'vitest';
import type { AuthenticationConfig } from '@/lib/models/authentication';
import type { RealmStrategies } from '@/lib/models/Realm';
import {
  buildPromoteBody,
  buildStrategiesPatch,
  countRealmsEnablingStrategy,
  formatRealmCounts,
  formatRealmStrategyCount,
  globalAccountLinkingDefaults,
  hasOwnCredentials,
  hasOwnOverrides,
  normalizeRealmSettingsForSave,
  promoteRealmSchema,
  realmSettingsSchema,
  realmsEnabled,
  slugSchema,
  strategiesToIdentityValues,
  suggestRealmSlug,
} from '@/lib/authentication/realms';

const configWith = (realms: unknown) =>
  ({ teams: { enabled: true, realms } }) as unknown as AuthenticationConfig;

describe('realmsEnabled', () => {
  it('is true only when teams.realms.enabled is true', () => {
    expect(
      realmsEnabled(
        configWith({
          enabled: true,
          cacheTtlMs: 5000,
          allowEmailDiscovery: false,
        })
      )
    ).toBe(true);
    expect(realmsEnabled(configWith({ enabled: false }))).toBe(false);
  });

  it('degrades to false for older backends without a realms key', () => {
    expect(realmsEnabled(configWith(undefined))).toBe(false);
    expect(realmsEnabled({} as AuthenticationConfig)).toBe(false);
    expect(realmsEnabled(undefined)).toBe(false);
  });
});

describe('slugSchema', () => {
  it.each(['acme', 'a1', 'acme-eu', '0acme', 'a'.repeat(63)])(
    'accepts %s',
    slug => {
      expect(slugSchema.safeParse(slug).success).toBe(true);
    }
  );

  it.each(['', 'a', '-acme', 'Acme', 'ac me', 'acme_eu', 'a'.repeat(64)])(
    'rejects %j',
    slug => {
      expect(slugSchema.safeParse(slug).success).toBe(false);
    }
  );
});

describe('realmSettingsSchema', () => {
  it('fills the server defaults from an empty object', () => {
    const parsed = realmSettingsSchema.parse({});
    expect(parsed.active).toBe(true);
    expect(parsed.strategies.local.enabled).toBe(true);
    expect(parsed.strategies.username.enabled).toBe(false);
    expect(parsed.registration.allowWithoutInvite).toBe(false);
    expect(parsed.policies).toEqual({
      requireTwoFa: false,
      requireVerifiedEmail: false,
      allowedClientIds: [],
      guests: { allowed: true, allowedHomeRealms: [] },
    });
  });

  it('requires a valid slug when promoting', () => {
    expect(promoteRealmSchema.safeParse({}).success).toBe(false);
    expect(promoteRealmSchema.safeParse({ slug: 'Bad Slug' }).success).toBe(
      false
    );
    expect(promoteRealmSchema.safeParse({ slug: 'acme' }).success).toBe(true);
  });

  it('keeps OAuth credentials optional and does not force account linking', () => {
    const parsed = realmSettingsSchema.parse({
      strategies: {
        local: { enabled: true },
        username: { enabled: false },
        magicLink: { enabled: false },
        phone: { enabled: false },
        metamask: { enabled: false },
        biometric: { enabled: false },
        oauth: { google: { enabled: true } },
      },
    });
    expect(parsed.strategies.oauth.google?.enabled).toBe(true);
    expect(parsed.strategies.oauth.google?.accountLinking).toBeUndefined();
  });
});

describe('normalizeRealmSettingsForSave', () => {
  it('drops empty credential fields so the provider inherits the global config', () => {
    const body = normalizeRealmSettingsForSave({
      strategies: {
        oauth: {
          google: {
            enabled: true,
            clientId: '',
            clientSecret: '   ',
            redirect_uri: '',
          },
          github: { enabled: true, clientId: 'abc', clientSecret: 's3cret' },
        },
      },
    });
    expect(body.strategies?.oauth?.google).toEqual({ enabled: true });
    expect(body.strategies?.oauth?.github).toEqual({
      enabled: true,
      clientId: 'abc',
      clientSecret: 's3cret',
    });
  });

  it('never sends has* flags or unknown keys', () => {
    const body = normalizeRealmSettingsForSave({
      strategies: {
        oauth: {
          apple: {
            enabled: true,
            hasClientSecret: true,
            hasPrivateKey: true,
            teamId: 'T1',
            keyId: '',
            bogus: 1,
          },
        },
      },
      _id: 'x',
      createdAt: 'now',
    });
    expect(body).toEqual({
      strategies: { oauth: { apple: { enabled: true, teamId: 'T1' } } },
    });
  });

  it('keeps empty lists (meaning "any") and cleans populated ones', () => {
    const body = normalizeRealmSettingsForSave({
      policies: {
        requireTwoFa: true,
        allowedClientIds: [' web ', 'web', ''],
        guests: { allowed: false, allowedHomeRealms: [] },
      },
    });
    expect(body.policies).toEqual({
      requireTwoFa: true,
      allowedClientIds: ['web'],
      guests: { allowed: false, allowedHomeRealms: [] },
    });
  });

  it('leaves absent sections absent, so a partial input is a partial PATCH', () => {
    expect(normalizeRealmSettingsForSave({ active: false })).toEqual({
      active: false,
    });
    expect(normalizeRealmSettingsForSave({})).toEqual({});
  });
});

describe('credential clearing semantics', () => {
  const CLEARED = {
    clientId: null,
    clientSecret: null,
    redirect_uri: null,
    privateKey: null,
    teamId: null,
    keyId: null,
  };

  it("credentials: 'inherit' sends null for every credential field", () => {
    const body = normalizeRealmSettingsForSave({
      strategies: {
        oauth: {
          google: {
            enabled: true,
            credentials: 'inherit',
            // Stale typed values must not leak through in inherit mode.
            clientId: 'stale',
            clientSecret: 'stale-secret',
          },
        },
      },
    });
    expect(body.strategies?.oauth?.google).toEqual({
      enabled: true,
      ...CLEARED,
    });
  });

  it("credentials: 'own' sends only non-blank typed values, trimmed", () => {
    const body = normalizeRealmSettingsForSave({
      strategies: {
        oauth: {
          apple: {
            enabled: true,
            credentials: 'own',
            clientId: '  abc  ',
            clientSecret: '',
            redirect_uri: '   ',
            privateKey: ' pk ',
            teamId: 'T1',
            keyId: null,
          },
        },
      },
    });
    expect(body.strategies?.oauth?.apple).toEqual({
      enabled: true,
      clientId: 'abc',
      privateKey: 'pk',
      teamId: 'T1',
    });
  });

  it('passes an explicit null through but still drops blank strings', () => {
    const body = normalizeRealmSettingsForSave({
      strategies: {
        oauth: {
          github: {
            enabled: true,
            clientId: null,
            clientSecret: '',
            redirect_uri: ' https://x.test/cb ',
          },
        },
      },
    });
    expect(body.strategies?.oauth?.github).toEqual({
      enabled: true,
      clientId: null,
      redirect_uri: 'https://x.test/cb',
    });
  });

  it("buildStrategiesPatch clears credentials when a row with its own switches to 'inherit'", () => {
    const current: RealmStrategies = {
      local: { enabled: true },
      username: { enabled: false },
      magicLink: { enabled: false },
      phone: { enabled: false },
      metamask: { enabled: false },
      biometric: { enabled: false },
      oauth: {
        google: { enabled: true, clientId: 'abc', hasClientSecret: true },
        github: { enabled: true },
      },
    };
    const next = strategiesToIdentityValues(current);
    next.oauth.google.credentials = 'inherit';
    next.oauth.github.credentials = 'inherit'; // nothing own to clear
    expect(buildStrategiesPatch(current, next)).toEqual({
      oauth: { google: CLEARED },
    });
  });

  it("buildStrategiesPatch sends no credential fields for 'own' or unset", () => {
    const current: RealmStrategies = {
      local: { enabled: true },
      username: { enabled: false },
      magicLink: { enabled: false },
      phone: { enabled: false },
      metamask: { enabled: false },
      biometric: { enabled: false },
      oauth: { google: { enabled: true, hasClientSecret: true } },
    };
    const next = strategiesToIdentityValues(current);
    next.oauth.google.credentials = 'own';
    expect(buildStrategiesPatch(current, next)).toEqual({});
  });

  it('buildStrategiesPatch resets a stored accountLinking override with the credentials', () => {
    const current: RealmStrategies = {
      local: { enabled: true },
      username: { enabled: false },
      magicLink: { enabled: false },
      phone: { enabled: false },
      metamask: { enabled: false },
      biometric: { enabled: false },
      oauth: {
        google: {
          enabled: true,
          clientId: 'abc',
          hasClientSecret: true,
          accountLinking: false,
        },
        github: { enabled: true, accountLinking: true },
        gitlab: { enabled: true, clientId: 'x' },
      },
    };
    const next = strategiesToIdentityValues(current);
    next.oauth.google.credentials = 'inherit';
    next.oauth.github.credentials = 'inherit';
    next.oauth.gitlab.credentials = 'inherit';
    expect(buildStrategiesPatch(current, next)).toEqual({
      oauth: {
        google: { ...CLEARED, accountLinking: null },
        github: { accountLinking: null },
        gitlab: CLEARED,
      },
    });
  });

  it('normalizeRealmSettingsForSave passes accountLinking null through', () => {
    const body = normalizeRealmSettingsForSave({
      strategies: {
        oauth: {
          google: { enabled: true, accountLinking: null },
          github: { accountLinking: false },
        },
      },
    } as never);
    expect(body.strategies?.oauth?.google).toEqual({
      enabled: true,
      accountLinking: null,
    });
    expect(body.strategies?.oauth?.github).toEqual({ accountLinking: false });
  });

  it('hasOwnOverrides adds an explicit accountLinking to the credentials', () => {
    expect(hasOwnOverrides(undefined)).toBe(false);
    expect(hasOwnOverrides({ enabled: true })).toBe(false);
    expect(hasOwnOverrides({ enabled: true, clientId: 'id' })).toBe(true);
    expect(hasOwnOverrides({ enabled: true, accountLinking: false })).toBe(
      true
    );
    expect(hasOwnCredentials({ enabled: true, accountLinking: false })).toBe(
      false
    );
  });

  it('globalAccountLinkingDefaults reads each provider, defaulting to on', () => {
    const defaults = globalAccountLinkingDefaults({
      google: { enabled: true, clientId: 'x', accountLinking: false },
      github: { enabled: true, clientId: 'y' },
    } as unknown as AuthenticationConfig);
    expect(defaults.google).toBe(false);
    expect(defaults.github).toBe(true);
    expect(defaults.apple).toBe(true);
    expect(globalAccountLinkingDefaults(undefined).google).toBe(true);
  });

  it('hasOwnCredentials reads the masked server row', () => {
    expect(hasOwnCredentials(undefined)).toBe(false);
    expect(hasOwnCredentials({ enabled: true })).toBe(false);
    expect(hasOwnCredentials({ enabled: true, hasPrivateKey: true })).toBe(
      true
    );
    expect(hasOwnCredentials({ enabled: true, clientId: ' ' })).toBe(false);
  });
});

describe('identity helpers', () => {
  const current: RealmStrategies = {
    local: { enabled: true },
    username: { enabled: false },
    magicLink: { enabled: false },
    phone: { enabled: false },
    metamask: { enabled: false },
    biometric: { enabled: false },
    oauth: { google: { enabled: true, hasClientSecret: true } },
  };

  it('produces an empty patch when nothing changed', () => {
    expect(
      buildStrategiesPatch(current, strategiesToIdentityValues(current))
    ).toEqual({});
  });

  it('patches only the changed switches and never touches credentials', () => {
    const next = strategiesToIdentityValues(current);
    next.magicLink.enabled = true;
    next.oauth.google.enabled = false;
    next.oauth.github.enabled = true;
    expect(buildStrategiesPatch(current, next)).toEqual({
      magicLink: { enabled: true },
      oauth: {
        google: { enabled: false },
        github: { enabled: true },
      },
    });
  });
});

describe('formatRealmCounts', () => {
  it('pluralises', () => {
    expect(formatRealmCounts({ home: 12, guest: 3 })).toBe(
      '12 home users, 3 guests'
    );
    expect(formatRealmCounts({ home: 1, guest: 1 })).toBe(
      '1 home user, 1 guest'
    );
  });
});

describe('buildPromoteBody', () => {
  it('keeps the slug, drops disabled OAuth rows and empty credentials', () => {
    const body = buildPromoteBody({
      slug: 'acme',
      strategies: {
        local: { enabled: true },
        oauth: {
          google: { enabled: true, clientId: '', clientSecret: '' },
          github: { enabled: false },
        },
      },
      policies: { requireTwoFa: true },
    });
    expect(body.slug).toBe('acme');
    expect(body.strategies?.oauth).toEqual({ google: { enabled: true } });
    expect(body.policies).toEqual({ requireTwoFa: true });
  });
});

describe('suggestRealmSlug', () => {
  it('derives a slug from a team name', () => {
    expect(suggestRealmSlug('Acme Corp EU')).toBe('acme-corp-eu');
    expect(suggestRealmSlug('  Café & Co.  ')).toBe('cafe-co');
    expect(isValidSuggestion(suggestRealmSlug('x'.repeat(100)))).toBe(true);
  });
});

function isValidSuggestion(slug: string) {
  return slugSchema.safeParse(slug).success;
}

describe('countRealmsEnablingStrategy', () => {
  const realmWith = (strategies: Partial<RealmStrategies>) => ({
    settings: {
      strategies: {
        local: { enabled: false },
        username: { enabled: false },
        magicLink: { enabled: false },
        phone: { enabled: false },
        metamask: { enabled: false },
        biometric: { enabled: false },
        oauth: {},
        ...strategies,
      },
    },
  });

  it('maps realm strategy keys onto the global strategy keys', () => {
    const counts = countRealmsEnablingStrategy([
      realmWith({
        local: { enabled: true },
        magicLink: { enabled: true },
        phone: { enabled: true },
        biometric: { enabled: true },
        oauth: { google: { enabled: true }, github: { enabled: false } },
      }),
      realmWith({
        local: { enabled: true },
        oauth: { google: { enabled: true }, apple: { enabled: true } },
      }),
    ] as never);
    expect(Object.fromEntries(counts)).toEqual({
      local: 2,
      magic_link: 1,
      phoneAuthentication: 1,
      biometricAuthentication: 1,
      google: 2,
      apple: 1,
    });
  });

  it('does not count inactive realms (the backend only looks at active ones)', () => {
    const inactive = {
      settings: {
        ...realmWith({ local: { enabled: true } }).settings,
        active: false,
      },
    };
    const active = {
      settings: {
        ...realmWith({ local: { enabled: true } }).settings,
        active: true,
      },
    };
    expect(
      Object.fromEntries(
        countRealmsEnablingStrategy([inactive, active, inactive] as never)
      )
    ).toEqual({ local: 1 });
    expect(countRealmsEnablingStrategy([inactive] as never).size).toBe(0);
  });

  it('is empty without realms and ignores strategies with no global card', () => {
    expect(countRealmsEnablingStrategy([]).size).toBe(0);
    expect(
      countRealmsEnablingStrategy([
        realmWith({ username: { enabled: true }, metamask: { enabled: true } }),
      ] as never).size
    ).toBe(0);
  });
});

describe('formatRealmStrategyCount', () => {
  it('pluralises and marks a capped count as a lower bound', () => {
    expect(formatRealmStrategyCount(1)).toBe('1 realm');
    expect(formatRealmStrategyCount(2)).toBe('2 realms');
    expect(formatRealmStrategyCount(100, true)).toBe('100+ realms');
  });
});
