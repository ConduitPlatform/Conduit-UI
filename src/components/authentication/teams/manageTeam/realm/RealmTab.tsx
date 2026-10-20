'use client';
import { useEffect, useState } from 'react';
import type { OAuthProviderKey, Realm } from '@/lib/models/Realm';
import type { Team } from '@/lib/models/Team';
import { RealmEmptyState } from '@/components/authentication/teams/manageTeam/realm/RealmEmptyState';
import { RealmIdentityCard } from '@/components/authentication/teams/manageTeam/realm/RealmIdentityCard';
import { RealmPoliciesCard } from '@/components/authentication/teams/manageTeam/realm/RealmPoliciesCard';
import { RealmStatusStrip } from '@/components/authentication/teams/manageTeam/realm/RealmStatusStrip';

/**
 * Content of the team's Realm tab. Switches on `team.realm?.enabled`:
 * not a realm -> explanation and promotion; realm -> status strip plus the Identity
 * and Policies cards, which save independently.
 */
export default function RealmTab({
  team,
  realm: initialRealm,
  memberCount,
  globalAccountLinking,
  globalVerificationRequired,
  supportsLinking,
}: Readonly<{
  team: Team;
  /** Loaded by the page when the team is a realm; null if that read failed. */
  realm: Realm | null;
  memberCount: number;
  /** Global `accountLinking` per OAuth provider: the baseline realms inherit. */
  globalAccountLinking?: Partial<Record<OAuthProviderKey, boolean>>;
  /** Global `local.verification.required`: what a realm inherits for verification. */
  globalVerificationRequired?: boolean;
  /** The authentication config reports `teams.realms.identityMode` (linking is supported). */
  supportsLinking?: boolean;
}>) {
  const [realm, setRealm] = useState<Realm | null>(initialRealm);
  useEffect(() => {
    setRealm(initialRealm);
  }, [initialRealm]);

  if (!team.realm?.enabled) {
    return (
      <RealmEmptyState
        team={team}
        memberCount={memberCount}
        supportsLinking={supportsLinking}
      />
    );
  }

  if (!realm) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Could not load this realm&apos;s settings. Reload the page to try again.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <RealmStatusStrip realm={realm} onChange={setRealm} />
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
        <RealmIdentityCard
          realm={realm}
          globalAccountLinking={globalAccountLinking}
          globalVerificationRequired={globalVerificationRequired}
          onChange={setRealm}
        />
        <RealmPoliciesCard realm={realm} onChange={setRealm} />
      </div>
    </div>
  );
}
