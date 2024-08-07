'use client';
import { Team } from '@/lib/models/Team';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { EditTeamSheet } from '@/components/authentication/teams/manageTeam/EditTeamSheet/EditTeamSheet';
import React, { useState } from 'react';
import { deleteTeam } from '@/lib/api/authentication';
import { useAlerts } from '@/components/providers/AlertProvider';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TeamProfile({
  team: initialTeam,
  parentTeam,
  memberCount,
  subTeamCount,
}: {
  team: Team;
  parentTeam?: Team;
  memberCount: number;
  subTeamCount: number;
}) {
  const [team, setTeam] = useState<Team>(initialTeam);
  const router = useRouter();
  const { addAlert } = useAlerts();
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
          <EditTeamSheet team={team} onSuccess={team => setTeam(team)}>
            <Button variant="outline">Edit</Button>
          </EditTeamSheet>
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
                        router.replace(
                          `/authentication/teams/${team.parentTeam}`
                        );
                      } else {
                        router.replace('/authentication/teams');
                      }
                    });
                  }
                },
              });
            }}
            disabled={team.isDefault}
          >
            Delete
          </Button>
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
            <div className="text-gray-500 dark:text-gray-400">
              {parentTeam ? parentTeam.name : '-'}
            </div>
          </div>
          <div className="grid gap-1">
            <Label>Members</Label>
            <div className="text-gray-500 dark:text-gray-400">
              {memberCount}
            </div>
          </div>
          <div className="grid gap-1">
            <Label>SubTeams</Label>
            <div className="text-gray-500 dark:text-gray-400">
              {subTeamCount}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
