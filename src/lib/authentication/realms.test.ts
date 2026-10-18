import { describe, expect, it } from 'vitest';
import type { AuthenticationConfig } from '@/lib/models/authentication';
import type { RealmStrategies } from '@/lib/models/Realm';
import {
  buildPromoteBody,
  buildStrategiesPatch,
  formatRealmCounts,
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
