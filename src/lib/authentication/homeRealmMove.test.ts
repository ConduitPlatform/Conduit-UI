import { describe, expect, it } from 'vitest';
import {
  describeHomeRealmMove,
  describeHomeRealmSessions,
} from '@/lib/authentication/homeRealmMove';

const email = 'ann@test.dev';

describe('describeHomeRealmMove', () => {
  it('from global: the global sessions end immediately', () => {
    const text = describeHomeRealmMove({
      email,
      from: null,
      to: 'acme',
      force: false,
    });
    expect(text).toBe(
      'ann@test.dev will sign in at acme instead of global. Their global sessions end immediately.'
    );
    expect(text).not.toContain('guest');
    expect(text).not.toContain('revoked');
  });

  it('from a realm to another: guest when trusted, otherwise stripped', () => {
    const text = describeHomeRealmMove({
      email,
      from: 'acme',
      to: 'beta',
      force: false,
    });
    expect(text).toContain('will sign in at beta instead of acme.');
    expect(text).toContain(
      'They are kept as a guest of acme if that realm trusts beta; otherwise they lose their membership and all teams in acme'
    );
    expect(text).toContain('sessions bound to acme end');
    expect(text).not.toContain('Their global sessions end');
  });

  it('from a realm to global: the old realm must accept global users', () => {
    const text = describeHomeRealmMove({
      email,
      from: 'acme',
      to: null,
      force: false,
    });
    expect(text).toContain('will sign in at global instead of acme.');
    expect(text).toContain(
      'kept as a guest of acme if that realm accepts global users; otherwise they lose their membership and all teams in acme'
    );
    expect(text).toContain('sessions bound to acme end');
  });

  it('force revokes every session, in every case', () => {
    for (const [from, to] of [
      [null, 'acme'],
      ['acme', 'beta'],
      ['acme', null],
    ] as const) {
      const text = describeHomeRealmMove({ email, from, to, force: true });
      expect(text.endsWith('All sessions are revoked.')).toBe(true);
    }
  });

  it('does not mention revocation without force', () => {
    expect(
      describeHomeRealmSessions({ from: 'acme', to: 'beta', force: false })
    ).not.toContain('All sessions are revoked');
  });

  it('has nothing to say when the realm does not change', () => {
    expect(
      describeHomeRealmSessions({ from: 'acme', to: 'acme', force: false })
    ).toBe('');
    expect(
      describeHomeRealmMove({ email, from: null, to: null, force: false })
    ).toBe('ann@test.dev will sign in at global instead of global.');
  });
});
