import Link from 'next/link';
import { Info } from 'lucide-react';
import type { Team } from '@/lib/models/Team';

/** Read-only notice on sub-teams: the realm owns identity and policies, not this team. */
export function RealmInheritedBanner({
  realmTeam,
}: Readonly<{ realmTeam: Team }>) {
  const slug = realmTeam.realm?.slug ?? realmTeam.name;
  return (
    <div
      role="note"
      className="flex flex-row items-center gap-2 rounded-md bg-callout-info-muted px-3 py-2 text-sm text-callout-info-foreground"
    >
      <Info className="h-4 w-4 shrink-0" />
      <p>
        Part of realm{' '}
        <Link
          href={`/authentication/teams/${realmTeam._id}?mode=realm`}
          className="font-mono font-semibold underline"
        >
          {slug}
        </Link>{' '}
        (inherits its identity and policies)
      </p>
    </div>
  );
}
