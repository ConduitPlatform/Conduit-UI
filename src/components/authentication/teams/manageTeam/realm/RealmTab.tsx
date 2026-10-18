'use client';
import { useEffect, useState } from 'react';
import type { Realm } from '@/lib/models/Realm';
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
}: Readonly<{
  team: Team;
  /** Loaded by the page when the team is a realm; null if that read failed. */
  realm: Realm | null;
  memberCount: number;
}>) {
  const [realm, setRealm] = useState<Realm | null>(initialRealm);
  useEffect(() => {
    setRealm(initialRealm);
  }, [initialRealm]);

  if (!team.realm?.enabled) {
    return <RealmEmptyState team={team} memberCount={memberCount} />;
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
        <RealmIdentityCard realm={realm} onChange={setRealm} />
        <RealmPoliciesCard realm={realm} onChange={setRealm} />
      </div>
    </div>
  );
}
