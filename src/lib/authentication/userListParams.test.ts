import { describe, expect, it } from 'vitest';
import {
  LEGACY_CAPABILITIES,
  USER_ADMIN_CAPABILITIES_V1,
} from '@/lib/authentication/userCapabilities';
import {
  applyUserListPatch,
  nextSort,
  parseUserListParams,
  providerChoices,
  serializeUserListParams,
} from '@/lib/authentication/userListParams';

const current = USER_ADMIN_CAPABILITIES_V1;

describe('parseUserListParams', () => {
  it('round-trips the supported params', () => {
    const params = new URLSearchParams(
      'skip=10&limit=20&search=ann&sort=-createdAt&isActive=true&isVerified=false&isAnonymous=false&hasTwoFA=true&provider=google&homeRealm=t1'
    );
    const parsed = parseUserListParams(params, current);
    expect(parsed).toEqual({
      skip: 10,
      limit: 20,
      search: 'ann',
      sort: '-createdAt',
      isActive: true,
      isVerified: false,
      isAnonymous: false,
      hasTwoFA: true,
      provider: 'google',
      homeRealm: 't1',
    });
    expect(
      parseUserListParams(serializeUserListParams(parsed), current)
    ).toEqual(parsed);
  });

  it('strips filters a legacy backend would silently ignore', () => {
    const params = new URLSearchParams(
      'isVerified=true&hasTwoFA=false&isAnonymous=false&isAnonymous=false&provider=phone&sort=-hashedPassword&provider=phone'
    );
    const parsed = parseUserListParams(params, LEGACY_CAPABILITIES);
    expect(parsed.isVerified).toBeUndefined();
    expect(parsed.hasTwoFA).toBeUndefined();
    expect(parsed.isAnonymous).toBeUndefined();
    expect(parsed.provider).toBeUndefined();
    expect(parsed.sort).toBeUndefined();
    expect(
      parseUserListParams(
        new URLSearchParams('isAnonymous=true'),
        LEGACY_CAPABILITIES
      ).isAnonymous
    ).toBe(true);
    expect(
      parseUserListParams(
        new URLSearchParams('provider=local'),
        LEGACY_CAPABILITIES
      ).provider
    ).toBe('local');
  });

  it('drops invalid values and clamps the page size', () => {
    const parsed = parseUserListParams(
      {
        skip: '-3',
        limit: '500',
        sort: 'email',
        provider: 'hashedPassword',
        isActive: 'yes',
      },
      current
    );
    expect(parsed.skip).toBe(0);
    expect(parsed.limit).toBe(25);
    expect(parsed.sort).toBe('email');
    expect(parsed.provider).toBeUndefined();
    expect(parsed.isActive).toBeUndefined();
  });

  it('resets skip when a filter changes and keeps the other filters', () => {
    const next = applyUserListPatch(
      new URLSearchParams('skip=20&search=ann&homeRealm=t1'),
      { isActive: false },
      LEGACY_CAPABILITIES
    );
    expect(next.get('skip')).toBeNull();
    expect(next.get('isActive')).toBe('false');
    expect(next.get('search')).toBe('ann');
    expect(next.get('homeRealm')).toBe('t1');
  });

  it('does not write a verified filter the backend cannot honour', () => {
    const next = applyUserListPatch(
      new URLSearchParams('search=ann'),
      { isVerified: true },
      LEGACY_CAPABILITIES
    );
    expect(next.get('isVerified')).toBeNull();
    expect(next.get('search')).toBe('ann');
  });

  it('cycles a sort column through ascending, descending, and off', () => {
    expect(nextSort(undefined, 'createdAt')).toBe('createdAt');
    expect(nextSort('createdAt', 'createdAt')).toBe('-createdAt');
    expect(nextSort('-createdAt', 'createdAt')).toBeUndefined();
    expect(nextSort('-email', 'createdAt')).toBe('createdAt');
  });
});

describe('providerChoices', () => {
  it('uses enabled strategies, and phone only with the capability', () => {
    const config = {
      local: { enabled: true },
      google: { enabled: true },
      github: { enabled: false },
      phoneAuthentication: { enabled: true },
    };
    expect(providerChoices(config, LEGACY_CAPABILITIES)).toEqual([
      'local',
      'google',
    ]);
    expect(providerChoices(config, current)).toEqual([
      'local',
      'google',
      'phone',
    ]);
    expect(providerChoices(null, LEGACY_CAPABILITIES)).toContain('twitter');
    expect(providerChoices(null, LEGACY_CAPABILITIES)).not.toContain('phone');
  });
});
