import { describe, expect, it } from 'vitest';
import type { Realm } from '@/lib/models/Realm';
import {
  buildRealmSlugMap,
  getPickerEligibility,
  homeRealmFilterToParam,
  homeRealmParamToFilter,
  homeRealmSelectionToTeamId,
  isRemovalBlocked,
  realmLabel,
  withHomeRealmFilter,
} from '@/lib/authentication/realmMembers';

describe('isRemovalBlocked', () => {
  it('blocks removing a home user from the realm team only', () => {
    expect(isRemovalBlocked('home', true)).toBe(true);
    expect(isRemovalBlocked('home', false)).toBe(false);
    expect(isRemovalBlocked('guest', true)).toBe(false);
    expect(isRemovalBlocked(undefined, true)).toBe(false);
  });
});

describe('getPickerEligibility', () => {
  const realmTeamId = 'realm-1';

  it('offers everybody on a plain team', () => {
    expect(getPickerEligibility({ _id: 'u', homeRealm: 'other' })).toEqual({
      selectable: true,
    });
  });

  it('never offers users that are already members', () => {
    const result = getPickerEligibility(
      { _id: 'u' },
      { memberIds: new Set(['u']) }
    );
    expect(result.selectable).toBe(false);
    expect(result.reason).toBe('Already a member');
  });

  it('only offers users without a home realm when guests are not allowed', () => {
    const ctx = {
      realmTeamId,
      guestPolicy: { allowed: false, allowedHomeRealms: [] },
    };
    expect(getPickerEligibility({ _id: 'a' }, ctx).selectable).toBe(true);
    expect(
      getPickerEligibility({ _id: 'b', homeRealm: null }, ctx).selectable
    ).toBe(true);
    const other = getPickerEligibility({ _id: 'c', homeRealm: 'other' }, ctx);
    expect(other.selectable).toBe(false);
    expect(other.reason).toBeDefined();
  });

  it('hints users homed elsewhere as guests when guests are allowed', () => {
    const ctx = {
      realmTeamId,
      guestPolicy: { allowed: true, allowedHomeRealms: [] },
    };
    expect(getPickerEligibility({ _id: 'a' }, ctx)).toEqual({
      selectable: true,
    });
    expect(getPickerEligibility({ _id: 'b', homeRealm: 'other' }, ctx)).toEqual(
      { selectable: true, hint: 'guest' }
    );
  });

  it('keeps home users of the realm out of the guest picker', () => {
    const result = getPickerEligibility(
      { _id: 'a', homeRealm: realmTeamId },
      { realmTeamId }
    );
    expect(result.selectable).toBe(false);
  });

  it('respects the trusted home realms list', () => {
    const ctx = {
      realmTeamId,
      guestPolicy: { allowed: true, allowedHomeRealms: ['trusted'] },
    };
    expect(
      getPickerEligibility({ _id: 'a', homeRealm: 'trusted' }, ctx).selectable
    ).toBe(true);
    expect(
      getPickerEligibility({ _id: 'b', homeRealm: 'other' }, ctx).selectable
    ).toBe(false);
    expect(getPickerEligibility({ _id: 'c' }, ctx).selectable).toBe(false);
  });

  it('offers everybody while the policy is unknown', () => {
    expect(
      getPickerEligibility({ _id: 'a', homeRealm: 'other' }, { realmTeamId })
    ).toEqual({ selectable: true, hint: 'guest' });
  });
});

describe('home realm filter mapping', () => {
  it('maps the select value to the query param', () => {
    expect(homeRealmFilterToParam('all')).toBeUndefined();
    expect(homeRealmFilterToParam('global')).toBe('global');
    expect(homeRealmFilterToParam('team-1')).toBe('team-1');
  });

  it('maps the query param back to the select value', () => {
    expect(homeRealmParamToFilter(null)).toBe('all');
    expect(homeRealmParamToFilter('global')).toBe('global');
    expect(homeRealmParamToFilter('team-1')).toBe('team-1');
  });

  it('sets the param, drops skip and keeps the rest', () => {
    const next = withHomeRealmFilter('search=ann&skip=20', 'team-1');
    expect(next.get('homeRealm')).toBe('team-1');
    expect(next.get('search')).toBe('ann');
    expect(next.has('skip')).toBe(false);
  });

  it('removes the param for "all"', () => {
    const next = withHomeRealmFilter('homeRealm=global&limit=10', 'all');
    expect(next.has('homeRealm')).toBe(false);
    expect(next.get('limit')).toBe('10');
  });

  it('maps "global" to no realm when creating or moving', () => {
    expect(homeRealmSelectionToTeamId('global')).toBeNull();
    expect(homeRealmSelectionToTeamId('team-1')).toBe('team-1');
  });
});

describe('realm slugs', () => {
  const realms = [
    { team: { _id: 't1', realm: { enabled: true, slug: 'acme' } } },
    { team: { _id: 't2', realm: { enabled: true } } },
  ] as unknown as Realm[];

  it('maps team ids to slugs and skips realms without one', () => {
    const map = buildRealmSlugMap(realms);
    expect([...map]).toEqual([['t1', 'acme']]);
  });

  it('falls back to the raw id for unknown realms', () => {
    const map = buildRealmSlugMap(realms);
    expect(realmLabel('t1', map)).toBe('acme');
    expect(realmLabel('gone', map)).toBe('gone');
    expect(realmLabel('gone', undefined)).toBe('gone');
  });
});
