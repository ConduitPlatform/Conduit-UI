'use client';

import { useCallback, useEffect, useState } from 'react';
import { getUserTeams } from '@/lib/api/authentication';
import { getResourceDefinition } from '@/lib/api/authorization';
import {
  TEAM_RESOURCE_NAME,
  teamMemberRolesAllowedForUser,
} from '@/lib/authorization/teamMemberRoles';
import type { UserTeamMembership } from '@/lib/models/User';

export type UserTeamsState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  teams: UserTeamMembership[];
  roles: string[];
  message?: string;
  reload: () => void;
};

function failureMessage(status: number | undefined, message: string): string {
  if (status === 404) return 'Not supported by this Conduit version';
  return message;
}

/** Teams of one user, plus the roles a user may hold on the Team resource. */
export function useUserTeams(userId: string, enabled: boolean): UserTeamsState {
  const [status, setStatus] = useState<UserTeamsState['status']>(
    enabled ? 'loading' : 'idle'
  );
  const [teams, setTeams] = useState<UserTeamMembership[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [message, setMessage] = useState<string | undefined>();

  const reload = useCallback(() => {
    if (!enabled) {
      setStatus('idle');
      setTeams([]);
      return;
    }
    setStatus('loading');
    void Promise.all([
      getUserTeams(userId),
      getResourceDefinition(TEAM_RESOURCE_NAME).catch(() => null),
    ]).then(([teamResult, definition]) => {
      setRoles(teamMemberRolesAllowedForUser(definition));
      if (!teamResult.ok) {
        setStatus('error');
        setMessage(failureMessage(teamResult.status, teamResult.message));
        return;
      }
      setTeams(teamResult.data.teams);
      setMessage(undefined);
      setStatus('ready');
    });
  }, [enabled, userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { status, teams, roles, message, reload };
}
