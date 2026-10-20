import type { IncomingMessage, ServerResponse } from 'node:http';
import { REALM_TEAM_ROLES } from './constants.ts';
import { isRecord, readJsonBody, sendJson } from './http.ts';
import {
  addGuests,
  addTeamMembers,
  authenticationConfig,
  buildRealm,
  createTeam,
  createUser,
  deleteTeam,
  demoteRealm,
  findTeam,
  findUser,
  listRealmMembers,
  listRealms,
  listTeamMembers,
  listTeams,
  listUsers,
  MockHttpError,
  moveHomeRealm,
  patchAuthenticationConfig,
  patchTeamMemberRoles,
  promoteTeam,
  removeGuest,
  removeTeamMembers,
  updateRealm,
  updateTeam,
  userRealms,
  type Paging,
} from './auth-state.ts';
import { getState } from './state.ts';

/**
 * HTTP surface of the authentication module (config, teams, users, realms) and the
 * authorization `Team` resource the role selects read. The domain logic lives in
 * `auth-state.ts`; this file only parses requests and shapes responses.
 */

function number(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return value !== null && value !== '' && Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function text(value: string | null): string | undefined {
  return value === null || value === '' ? undefined : value;
}

/** Only the string `true` / `false` count, like the backend's strict parsing. */
function flag(value: string | null): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function paging(search: URLSearchParams, defaultLimit = 25): Paging {
  return {
    skip: number(search.get('skip'), 0),
    limit: number(search.get('limit'), defaultLimit),
    sort: text(search.get('sort')),
  };
}

/** axios sends arrays as `key[]=a&key[]=b`; accept both spellings. */
function listParam(search: URLSearchParams, key: string): string[] {
  return [...search.getAll(key), ...search.getAll(`${key}[]`)].filter(Boolean);
}

/** Hermes REST error shape; `conduitCode` is only present for module errors. */
export function sendMockError(
  response: ServerResponse,
  error: MockHttpError
): void {
  sendJson(response, error.status, {
    name: error.conduitCode ?? 'ConduitError',
    status: error.status,
    message: error.message,
    ...(error.conduitCode ? { conduitCode: error.conduitCode } : {}),
  });
}

async function body(request: IncomingMessage): Promise<unknown> {
  return readJsonBody(request);
}

const TEAM_RESOURCE = {
  _id: 'resource_team',
  name: 'Team',
  version: 1,
  relations: {
    owner: ['User', 'Team'],
    admin: ['User'],
    member: ['User'],
  },
  permissions: {
    read: REALM_TEAM_ROLES.map(role => role),
  },
};

async function route(
  method: string,
  pathname: string,
  search: URLSearchParams,
  request: IncomingMessage,
  response: ServerResponse
): Promise<boolean> {
  const auth = getState().auth;
  let match: RegExpExecArray | null;

  if (pathname === '/config/authentication') {
    if (method === 'GET') {
      sendJson(response, 200, { config: authenticationConfig(auth) });
      return true;
    }
    if (method === 'PATCH') {
      sendJson(response, 200, {
        config: patchAuthenticationConfig(auth, await body(request)),
      });
      return true;
    }
    return false;
  }

  if (
    (match = /^\/authorization\/resources\/([^/]+)$/.exec(pathname)) &&
    method === 'GET'
  ) {
    if (match[1] === 'Team' || match[1] === TEAM_RESOURCE._id) {
      sendJson(response, 200, TEAM_RESOURCE);
    } else {
      sendJson(response, 404, { status: 404, message: 'Resource not found' });
    }
    return true;
  }

  if (!pathname.startsWith('/authentication/')) return false;

  /* Teams ------------------------------------------------------------------ */

  if (pathname === '/authentication/teams') {
    if (method === 'GET') {
      sendJson(
        response,
        200,
        listTeams(auth, paging(search), {
          search: text(search.get('search')),
          parentTeam: text(search.get('parentTeam')),
          realm: flag(search.get('realm')),
        })
      );
      return true;
    }
    if (method === 'POST') {
      sendJson(response, 200, createTeam(auth, await body(request)));
      return true;
    }
    return false;
  }

  if ((match = /^\/authentication\/teams\/([^/]+)$/.exec(pathname))) {
    if (method === 'GET') {
      sendJson(response, 200, findTeam(auth, match[1]));
      return true;
    }
    if (method === 'PATCH') {
      sendJson(response, 200, updateTeam(auth, match[1], await body(request)));
      return true;
    }
    if (method === 'DELETE') {
      sendJson(response, 200, deleteTeam(auth, match[1]));
      return true;
    }
    return false;
  }

  if ((match = /^\/authentication\/teams\/([^/]+)\/members$/.exec(pathname))) {
    const teamId = match[1];
    if (method === 'GET') {
      sendJson(
        response,
        200,
        listTeamMembers(
          auth,
          teamId,
          paging(search),
          text(search.get('search'))
        )
      );
      return true;
    }
    if (method === 'POST') {
      sendJson(
        response,
        200,
        addTeamMembers(auth, teamId, await body(request))
      );
      return true;
    }
    if (method === 'DELETE') {
      sendJson(
        response,
        200,
        removeTeamMembers(auth, teamId, listParam(search, 'members'))
      );
      return true;
    }
    if (method === 'PATCH') {
      sendJson(
        response,
        200,
        patchTeamMemberRoles(auth, teamId, await body(request))
      );
      return true;
    }
    return false;
  }

  if (
    (match = /^\/authentication\/teams\/([^/]+)\/invites$/.exec(pathname)) &&
    method === 'GET'
  ) {
    findTeam(auth, match[1]);
    sendJson(response, 200, { invites: [], count: 0 });
    return true;
  }

  /* Realms ----------------------------------------------------------------- */

  if ((match = /^\/authentication\/teams\/([^/]+)\/realm$/.exec(pathname))) {
    const teamId = match[1];
    if (method === 'POST') {
      sendJson(response, 200, promoteTeam(auth, teamId, await body(request)));
      return true;
    }
    if (method === 'PATCH') {
      sendJson(response, 200, updateRealm(auth, teamId, await body(request)));
      return true;
    }
    if (method === 'DELETE') {
      sendJson(
        response,
        200,
        demoteRealm(auth, teamId, search.get('force') === 'true')
      );
      return true;
    }
    return false;
  }

  if (pathname === '/authentication/realms' && method === 'GET') {
    sendJson(
      response,
      200,
      listRealms(auth, paging(search), text(search.get('search')))
    );
    return true;
  }

  if (
    (match = /^\/authentication\/realms\/([^/]+)$/.exec(pathname)) &&
    method === 'GET'
  ) {
    sendJson(response, 200, buildRealm(auth, match[1]));
    return true;
  }

  if (
    (match = /^\/authentication\/realms\/([^/]+)\/members$/.exec(pathname)) &&
    method === 'GET'
  ) {
    sendJson(
      response,
      200,
      listRealmMembers(
        auth,
        match[1],
        text(search.get('type')),
        paging(search),
        text(search.get('search'))
      )
    );
    return true;
  }

  if (
    (match = /^\/authentication\/realms\/([^/]+)\/guests$/.exec(pathname)) &&
    method === 'POST'
  ) {
    sendJson(response, 200, addGuests(auth, match[1], await body(request)));
    return true;
  }

  if (
    (match = /^\/authentication\/realms\/([^/]+)\/guests\/([^/]+)$/.exec(
      pathname
    )) &&
    method === 'DELETE'
  ) {
    sendJson(response, 200, removeGuest(auth, match[1], match[2]));
    return true;
  }

  /* Users ------------------------------------------------------------------ */

  if (pathname === '/authentication/users') {
    if (method === 'GET') {
      sendJson(
        response,
        200,
        listUsers(auth, paging(search), {
          search: text(search.get('search')),
          isActive: flag(search.get('isActive')),
          homeRealm: text(search.get('homeRealm')),
          realm: text(search.get('realm')),
        })
      );
      return true;
    }
    if (method === 'POST') {
      sendJson(response, 200, createUser(auth, await body(request)));
      return true;
    }
    if (method === 'DELETE') {
      const ids = listParam(search, 'ids');
      auth.users = auth.users.filter(user => !ids.includes(user._id));
      sendJson(response, 200, 'OK');
      return true;
    }
    return false;
  }

  if (
    (match = /^\/authentication\/users\/([^/]+)\/realms$/.exec(pathname)) &&
    method === 'GET'
  ) {
    sendJson(response, 200, userRealms(auth, match[1]));
    return true;
  }

  if (
    (match = /^\/authentication\/users\/([^/]+)\/home-realm$/.exec(pathname)) &&
    method === 'POST'
  ) {
    sendJson(response, 200, moveHomeRealm(auth, match[1], await body(request)));
    return true;
  }

  if (
    (match = /^\/authentication\/users\/([^/]+)\/(block|unblock)$/.exec(
      pathname
    )) &&
    method === 'POST'
  ) {
    findUser(auth, match[1]).active = match[2] === 'unblock';
    sendJson(response, 200, 'OK');
    return true;
  }

  if ((match = /^\/authentication\/users\/([^/]+)$/.exec(pathname))) {
    if (method === 'PATCH') {
      const user = findUser(auth, match[1]);
      const patch = await body(request);
      if (isRecord(patch)) Object.assign(user, patch);
      sendJson(response, 200, user);
      return true;
    }
    if (method === 'DELETE') {
      const user = findUser(auth, match[1]);
      auth.users = auth.users.filter(item => item !== user);
      sendJson(response, 200, 'OK');
      return true;
    }
  }

  return false;
}

/**
 * Returns whether the request was an authentication or authorization-resource route.
 * Module errors become the hermes REST error shape (`conduitCode` in the body).
 */
export async function handleAuthenticationRequest(
  method: string,
  pathname: string,
  search: URLSearchParams,
  request: IncomingMessage,
  response: ServerResponse
): Promise<boolean> {
  try {
    return await route(method, pathname, search, request, response);
  } catch (error) {
    if (error instanceof MockHttpError) {
      sendMockError(response, error);
      return true;
    }
    throw error;
  }
}
