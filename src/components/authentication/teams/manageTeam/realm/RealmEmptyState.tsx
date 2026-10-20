'use client';
import { Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import type { Team } from '@/lib/models/Team';
import { PromoteRealmSheet } from '@/components/authentication/teams/manageTeam/realm/PromoteRealmSheet';

export const DEFAULT_TEAM_REALM_NOTE =
  'The default team cannot be a realm. Turn off "Default Team" in Edit first.';

/** Shown for a top-level team that is not (yet) a realm. */
export function RealmEmptyState({
  team,
  memberCount,
  supportsLinking,
}: Readonly<{
  team: Team;
  memberCount: number;
  supportsLinking?: boolean;
}>) {
  return (
    <Card>
      <CardContent className="pt-3">
        <EmptyState
          icon={Landmark}
          title="This team is not a realm"
          description="A realm is a team that owns its users' identity: its own sign-in methods and policies, separate from the rest of the platform. Members become home users who sign in only here; other users can be added as guests."
          action={
            team.isDefault ? (
              <div className="flex flex-col items-center gap-2">
                <Button disabled>Make this team a realm</Button>
                <p
                  role="note"
                  className="max-w-sm text-xs text-muted-foreground"
                >
                  {DEFAULT_TEAM_REALM_NOTE}
                </p>
              </div>
            ) : (
              <PromoteRealmSheet
                team={team}
                memberCount={memberCount}
                supportsLinking={supportsLinking}
              >
                <Button>Make this team a realm</Button>
              </PromoteRealmSheet>
            )
          }
        />
      </CardContent>
    </Card>
  );
}
