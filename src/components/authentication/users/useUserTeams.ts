'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getUserTeams } from '@/lib/api/authentication';
import { getResourceDefinition } from '@/lib/api/authorization';
import type { ActionFailure } from '@/lib/api/action-result';
import {
  TEAM_RESOURCE_NAME,
  teamMemberRolesAllowedForUser,
} from '@/lib/authorization/teamMemberRoles';
import type { UserTeamMembership } from '@/lib/models/User';

export const USER_TEAMS_PAGE_SIZE = 50;
/** Upper bound on the teams loaded for one user. */
export const USER_TEAMS_MAX = 500;

export type UserTeamsState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  teams: UserTeamMembership[];
  /** Teams the user belongs to. Larger than `teams.length` past `USER_TEAMS_MAX`. */
  count: number;
  roles: string[];
  message?: string;
  reload: () => void;
};

function failureMessage(status: number | undefined, message: string): string {
  if (status === 404) return 'Not supported by this Conduit version';
  return message;
}

type AllTeams =
  | { ok: true; teams: UserTeamMembership[]; count: number }
  | ActionFailure;

/** Every page of the user's teams. A team repeated across pages keeps all its roles. */
async function loadAllUserTeams(userId: string): Promise<AllTeams> {
  const byId = new Map<string, UserTeamMembership>();
  let count = 0;
  let skip = 0;
  while (skip < USER_TEAMS_MAX) {
    const result = await getUserTeams(userId, {
      skip,
      limit: USER_TEAMS_PAGE_SIZE,
    });
    if (!result.ok) return result;
    const page = result.data.teams ?? [];
    for (const team of page) {
      const known = byId.get(team._id);
      if (!known) {
        byId.set(team._id, { ...team, roles: [...(team.roles ?? [])] });
        continue;
      }
      for (const role of team.roles ?? []) {
        if (!known.roles.includes(role)) known.roles.push(role);
      }
    }
    count = Math.max(result.data.count ?? 0, byId.size);
    skip += page.length;
    if (page.length === 0 || skip >= count) break;
  }
  return { ok: true, teams: [...byId.values()], count };
}

/** Teams of one user, plus the roles a user may hold on the Team resource. */
export function useUserTeams(userId: string, enabled: boolean): UserTeamsState {
  const [status, setStatus] = useState<UserTeamsState['status']>(
    enabled ? 'loading' : 'idle'
  );
  const [teams, setTeams] = useState<UserTeamMembership[]>([]);
  const [count, setCount] = useState(0);
  const [roles, setRoles] = useState<string[]>([]);
  const [message, setMessage] = useState<string | undefined>();
  const latest = useRef(0);

  const reload = useCallback(() => {
    latest.current += 1;
    const request = latest.current;
    if (!enabled) {
      setStatus('idle');
      setTeams([]);
      setCount(0);
      return;
    }
    setStatus('loading');
    void Promise.all([
      loadAllUserTeams(userId).catch(
        (error: unknown): ActionFailure => ({
          ok: false,
          code: 'UNKNOWN',
          message:
            error instanceof Error && error.message
              ? error.message
              : 'Teams could not be loaded.',
        })
      ),
      getResourceDefinition(TEAM_RESOURCE_NAME).catch(() => null),
    ]).then(([teamResult, definition]) => {
      // A newer load (another user, or a reload) owns the state.
      if (request !== latest.current) return;
      setRoles(teamMemberRolesAllowedForUser(definition));
      if (!teamResult.ok) {
        setStatus('error');
        setMessage(failureMessage(teamResult.status, teamResult.message));
        return;
      }
      setTeams(teamResult.teams);
      setCount(teamResult.count);
      setMessage(undefined);
      setStatus('ready');
    });
  }, [enabled, userId]);

  useEffect(() => {
    reload();
    return () => {
      latest.current += 1;
    };
  }, [reload]);

  return { status, teams, count, roles, message, reload };
}
