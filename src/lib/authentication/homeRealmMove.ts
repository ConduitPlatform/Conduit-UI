/**
 * Pure text for the "Move home realm" confirmation. It mirrors what the backend does in
 * `moveUserHomeRealm`:
 * - from global: the user's global (realm-less) sessions end immediately;
 * - from a realm: the old membership stays as a guest one when the old realm's guest
 *   policy accepts the new home, otherwise the membership and every team relation in
 *   the old realm are removed and the sessions bound to the old realm end;
 * - `force`: every session of the user is revoked.
 */

/** `null` is the global scope (no home realm); a string is a realm slug. */
export type HomeRealmScope = string | null;

export type HomeRealmMove = {
  email: string;
  from: HomeRealmScope;
  to: HomeRealmScope;
  force: boolean;
};

const label = (scope: HomeRealmScope) => scope ?? 'global';

/** What happens to the user's access, in sentences. Empty when nothing moves. */
export function describeHomeRealmSessions({
  from,
  to,
  force,
}: Omit<HomeRealmMove, 'email'>): string {
  if (from === to) return '';
  const parts: string[] = [];
  if (from === null) {
    parts.push('Their global sessions end immediately.');
  } else {
    const accepts =
      to === null ? 'accepts global users' : `trusts ${label(to)}`;
    parts.push(
      `They are kept as a guest of ${from} if that realm ${accepts}; otherwise they lose their membership and all teams in ${from}, and the sessions bound to ${from} end.`
    );
  }
  if (force) parts.push('All sessions are revoked.');
  return parts.join(' ');
}

/** Alert text for moving a user to another home realm. */
export function describeHomeRealmMove(move: HomeRealmMove): string {
  const { email, from, to } = move;
  const lead = `${email} will sign in at ${label(to)} instead of ${label(from)}.`;
  const rest = describeHomeRealmSessions(move);
  return rest ? `${lead} ${rest}` : lead;
}
