import { describe, expect, it } from 'vitest';
import type { Realm } from '@/lib/models/Realm';
import {
  becomesHomeUser,
  buildRealmSlugMap,
  candidateIneligibility,
  classifyCandidate,
  describeHomeConversion,
  getPickerEligibility,
  homeRealmFilterToParam,
  homeRealmParamToFilter,
  homeRealmSelectionToTeamId,
  isCandidateEligible,
  isRemovalBlocked,
  realmLabel,
  toGuestPolicy,
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

describe('classifyCandidate', () => {
  it('makes users without a home realm, or homed here, home users', () => {
    expect(classifyCandidate({}, 'r1')).toBe('home');
    expect(classifyCandidate({ homeRealm: null }, 'r1')).toBe('home');
    expect(classifyCandidate({ homeRealm: 'r1' }, 'r1')).toBe('home');
  });

  it('makes users homed elsewhere guests', () => {
    expect(classifyCandidate({ homeRealm: 'r2' }, 'r1')).toBe('guest');
  });
});

describe('becomesHomeUser / describeHomeConversion', () => {
  it('flags users without a home realm, inside a realm only', () => {
    expect(becomesHomeUser({}, 'r1')).toBe(true);
    expect(becomesHomeUser({ homeRealm: null }, 'r1')).toBe(true);
    expect(becomesHomeUser({ homeRealm: 'r1' }, 'r1')).toBe(false);
    expect(becomesHomeUser({ homeRealm: 'r2' }, 'r1')).toBe(false);
    expect(becomesHomeUser({}, undefined)).toBe(false);
  });

  it('words the confirmation', () => {
    expect(describeHomeConversion(1, 'acme')).toBe(
      '1 user becomes a home user of acme. Their global sessions end and they can only sign in at this realm.'
    );
    expect(describeHomeConversion(3, 'acme')).toBe(
      '3 users become home users of acme. Their global sessions end and they can only sign in at this realm.'
    );
  });
});

describe('isCandidateEligible', () => {
  const realmTeamId = 'r1';
  const open = { allowed: true, allowedHomeRealms: [] };

  it('offers everybody on a plain team except members', () => {
    expect(isCandidateEligible({ _id: 'u', homeRealm: 'other' })).toBe(true);
    expect(
      isCandidateEligible({ _id: 'u' }, { existingMemberIds: new Set(['u']) })
    ).toBe(false);
    expect(
      isCandidateEligible({ _id: 'u' }, { existingMemberIds: ['u'] })
    ).toBe(false);
  });

  it('always offers global users, even when guests are not allowed', () => {
    const guests = { allowed: false, allowedHomeRealms: ['x'] };
    expect(isCandidateEligible({ _id: 'a' }, { realmTeamId, guests })).toBe(
      true
    );
    expect(
      isCandidateEligible(
        { _id: 'b', homeRealm: null },
        { realmTeamId, guests }
      )
    ).toBe(true);
  });

  it('offers users homed in this realm', () => {
    expect(
      isCandidateEligible(
        { _id: 'a', homeRealm: realmTeamId },
        { realmTeamId, guests: { allowed: false, allowedHomeRealms: [] } }
      )
    ).toBe(true);
  });

  it('rejects guests when guests are not allowed', () => {
    const ctx = {
      realmTeamId,
      guests: { allowed: false, allowedHomeRealms: [] },
    };
    expect(isCandidateEligible({ _id: 'c', homeRealm: 'other' }, ctx)).toBe(
      false
    );
    expect(
      candidateIneligibility({ _id: 'c', homeRealm: 'other' }, ctx)
    ).toBeDefined();
  });

  it('accepts any guest when the trusted list is empty', () => {
    expect(
      isCandidateEligible(
        { _id: 'a', homeRealm: 'other' },
        { realmTeamId, guests: open }
      )
    ).toBe(true);
  });

  it('respects allowedHomeRealms for guests only', () => {
    const ctx = {
      realmTeamId,
      guests: { allowed: true, allowedHomeRealms: ['trusted'] },
    };
    expect(isCandidateEligible({ _id: 'a', homeRealm: 'trusted' }, ctx)).toBe(
      true
    );
    expect(isCandidateEligible({ _id: 'b', homeRealm: 'other' }, ctx)).toBe(
      false
    );
    // global users become home users: the trusted list does not apply
    expect(isCandidateEligible({ _id: 'c' }, ctx)).toBe(true);
  });

  it('ignores blank entries of a stored trusted list', () => {
    const ctx = {
      realmTeamId,
      guests: { allowed: true, allowedHomeRealms: [''] },
    };
    expect(isCandidateEligible({ _id: 'b', homeRealm: 'other' }, ctx)).toBe(
      true
    );
  });

  it('leaves the decision to the backend while the policy is unknown', () => {
    expect(
      isCandidateEligible({ _id: 'a', homeRealm: 'other' }, { realmTeamId })
    ).toBe(true);
  });

  it('never offers existing members, whatever their class', () => {
    expect(
      isCandidateEligible(
        { _id: 'a', homeRealm: realmTeamId },
        { realmTeamId, guests: open, existingMemberIds: new Set(['a']) }
      )
    ).toBe(false);
  });
});

describe('getPickerEligibility', () => {
  const ctx = {
    realmTeamId: 'r1',
    guests: { allowed: true, allowedHomeRealms: [] },
  };

  it('explains members', () => {
    expect(
      getPickerEligibility({ _id: 'u' }, { existingMemberIds: new Set(['u']) })
    ).toEqual({ selectable: false, reason: 'Already a member' });
  });

  it('hints home-classified global users and guest-classified candidates', () => {
    expect(getPickerEligibility({ _id: 'a' }, ctx)).toEqual({
      selectable: true,
      hint: 'home',
    });
    expect(getPickerEligibility({ _id: 'a', homeRealm: null }, ctx).hint).toBe(
      'home'
    );
    // Already homed here: no change, so no hint.
    expect(getPickerEligibility({ _id: 'a', homeRealm: 'r1' }, ctx)).toEqual({
      selectable: true,
    });
    // Outside a realm there is nothing to become.
    expect(getPickerEligibility({ _id: 'a' })).toEqual({ selectable: true });
    expect(getPickerEligibility({ _id: 'b', homeRealm: 'other' }, ctx)).toEqual(
      { selectable: true, hint: 'guest' }
    );
  });

  it('gives a reason for rejected guests', () => {
    expect(
      getPickerEligibility(
        { _id: 'b', homeRealm: 'other' },
        { ...ctx, guests: { allowed: false, allowedHomeRealms: [] } }
      )
    ).toEqual({ selectable: false, reason: 'Guests are not allowed' });
    expect(
      getPickerEligibility(
        { _id: 'b', homeRealm: 'other' },
        { ...ctx, guests: { allowed: true, allowedHomeRealms: ['t'] } }
      ).reason
    ).toBe('Home realm is not trusted by this realm');
  });
});

describe('toGuestPolicy', () => {
  it('normalizes the stored policy', () => {
    expect(
      toGuestPolicy({ allowed: true, allowedHomeRealms: ['a', ''] })
    ).toEqual({
      allowed: true,
      allowedHomeRealms: ['a'],
    });
    expect(toGuestPolicy(undefined)).toBeUndefined();
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
