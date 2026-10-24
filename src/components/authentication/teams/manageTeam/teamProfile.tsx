'use client';
import { Team } from '@/lib/models/Team';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { EditTeamSheet } from '@/components/authentication/teams/manageTeam/EditTeamSheet/EditTeamSheet';
import React, { useEffect, useState } from 'react';
import { deleteTeam } from '@/lib/api/authentication';
import { useAlerts } from '@/components/providers/AlertProvider';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function TeamProfile({
  team: initialTeam,
  parentTeam,
  memberCount,
  subTeamCount,
  realmsEnabled = false,
}: Readonly<{
  team: Team;
  parentTeam?: Team;
  memberCount: number;
  subTeamCount: number;
  /** Shows the realm slug in the profile. Delete protection does not depend on it. */
  realmsEnabled?: boolean;
}>) {
  const [team, setTeam] = useState<Team>(initialTeam);
  // Follow the server after router.refresh() (e.g. a promote or demote elsewhere on the page).
  useEffect(() => {
    setTeam(initialTeam);
  }, [initialTeam]);
  // Delete protection follows the data, not the feature flag: a realm team must stay
  // protected even if the flag is switched off afterwards.
  const isRealm = team.realm?.enabled === true;
  const router = useRouter();
  const { addAlert } = useAlerts();
  const deleteButton = (
    <Button
      variant="destructive"
      onClick={() => {
        addAlert({
          title: 'Delete Team',
          description:
            'Are you sure you want to delete this team? All members will be removed and any subteams will become standalone teams. This action cannot be undone!',
          cancelText: 'Cancel',
          actionText: 'Delete',
          onDecision: cancel => {
            if (!cancel) {
              return deleteTeam(team._id).then(() => {
                if (team.parentTeam) {
                  router.replace(`/authentication/teams/${team.parentTeam}`);
                } else {
                  router.replace('/authentication/teams');
                }
              });
            }
          },
        });
      }}
      disabled={team.isDefault || isRealm}
    >
      Delete
    </Button>
  );
  return (
    <>
      <div className={'flex flex-row justify-between'}>
        <div className="text-lg font-medium flex flex-row items-center">
          <Link
            className={'underline'}
            href={
              parentTeam
                ? `/authentication/teams/${parentTeam._id}`
                : '/authentication/teams'
            }
          >
            {parentTeam ? `${parentTeam.name}` : 'Home'}
          </Link>
          <ArrowRightIcon className={'w-4 h-4 mx-2'} />
          {team.name}
        </div>
        <div className={'flex space-x-3'}>
          <EditTeamSheet
            team={team}
            onSuccess={updated => setTeam(prev => ({ ...prev, ...updated }))}
          >
            <Button variant="outline">Edit</Button>
          </EditTeamSheet>
          {isRealm ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* A disabled button swallows pointer events, so the span carries the tooltip. */}
                  <span tabIndex={0}>{deleteButton}</span>
                </TooltipTrigger>
                <TooltipContent>
                  Realm teams cannot be deleted. Demote the realm first (Realm
                  tab).
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            deleteButton
          )}
        </div>
      </div>
      <Card className={'pt-4'}>
        <CardContent className="grid grid-cols-2 gap-6">
          <div className="grid gap-1">
            <Label>Team Name</Label>
            <div className="text-lg font-medium">{team.name}</div>
          </div>
          <div className="grid gap-1">
            <Label>Parent Team</Label>
            <div className="text-foreground-muted">
              {parentTeam ? parentTeam.name : '-'}
            </div>
          </div>
          <div className="grid gap-1">
            <Label>Members</Label>
            <div className="text-foreground-muted">{memberCount}</div>
          </div>
          <div className="grid gap-1">
            <Label>SubTeams</Label>
            <div className="text-foreground-muted">{subTeamCount}</div>
          </div>
          {realmsEnabled && isRealm && (
            <div className="grid gap-1">
              <Label>Realm</Label>
              <div className="flex flex-row items-center gap-2 text-foreground-muted">
                <span className="inline-flex items-center rounded-full bg-callout-info-muted px-2.5 py-0.5 font-mono text-xs font-medium text-callout-info-foreground">
                  {team.realm?.slug}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
