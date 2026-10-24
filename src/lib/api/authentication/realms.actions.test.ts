import { AxiosError, type AxiosResponse } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const client = vi.hoisted(() => ({
  get: vi.fn(),
  delete: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ getApiClient: async () => client }));

import {
  addRealmGuests,
  addTeamMembers,
  createUser,
  demoteRealm,
  patchTeamMembersRoles,
  promoteTeamToRealm,
  removeTeamMembers,
  setUserHomeRealm,
  updateRealm,
} from '@/lib/api/authentication';

const failure = (status: number, conduitCode: string, message: string) =>
  new AxiosError(
    `Request failed with status code ${status}`,
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    {
      status,
      data: { name: 'FAILED_PRECONDITION', status, message, conduitCode },
    } as AxiosResponse
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe('demoteRealm', () => {
  it('returns REALM_HAS_HOME_USERS for the 412 refusal without force', async () => {
    client.delete.mockRejectedValueOnce(
      failure(412, 'REALM_HAS_HOME_USERS', 'Realm has 12 home users')
    );
    const result = await demoteRealm('t1');
    expect(result).toEqual({
      ok: false,
      code: 'REALM_HAS_HOME_USERS',
      message: 'Realm has 12 home users',
      status: 412,
    });
    expect(client.delete).toHaveBeenCalledWith(
      '/authentication/teams/t1/realm',
      {
        params: undefined,
      }
    );
  });

  it('does not treat REALMS_DISABLED (also 412) as the home users refusal', async () => {
    client.delete.mockRejectedValueOnce(
      failure(412, 'REALMS_DISABLED', 'Realms are disabled')
    );
    const result = await demoteRealm('t1');
    expect(result).toEqual({
      ok: false,
      code: 'REALMS_DISABLED',
      message: 'Realms are disabled',
      status: 412,
    });
  });

  it('succeeds with force and sends ?force=true', async () => {
    client.delete.mockResolvedValueOnce({
      data: { message: 'OK', blockedUsers: 12 },
    });
    const result = await demoteRealm('t1', true);
    expect(result).toEqual({
      ok: true,
      data: { message: 'OK', blockedUsers: 12 },
    });
    expect(client.delete).toHaveBeenCalledWith(
      '/authentication/teams/t1/realm',
      {
        params: { force: true },
      }
    );
  });
});

describe('other realm actions return ActionResult', () => {
  it('promoteTeamToRealm surfaces conduitCode in the return value', async () => {
    client.post.mockRejectedValueOnce(
      failure(409, 'REALM_SLUG_TAKEN', 'Slug taken')
    );
    await expect(promoteTeamToRealm('t1', { slug: 'acme' })).resolves.toEqual({
      ok: false,
      code: 'REALM_SLUG_TAKEN',
      message: 'Slug taken',
      status: 409,
    });
  });

  it('updateRealm wraps the response data', async () => {
    client.patch.mockResolvedValueOnce({ data: { team: { _id: 't1' } } });
    await expect(updateRealm('t1', { active: false })).resolves.toEqual({
      ok: true,
      data: { team: { _id: 't1' } },
    });
    expect(client.patch).toHaveBeenCalledWith(
      '/authentication/teams/t1/realm',
      { active: false }
    );
  });

  it('addRealmGuests and setUserHomeRealm return failures instead of throwing', async () => {
    client.post
      .mockRejectedValueOnce(failure(403, 'GUESTS_NOT_ALLOWED', 'no guests'))
      .mockRejectedValueOnce(failure(404, 'REALM_NOT_FOUND', 'missing'));
    await expect(addRealmGuests('t1', ['u1'])).resolves.toMatchObject({
      ok: false,
      code: 'GUESTS_NOT_ALLOWED',
    });
    await expect(setUserHomeRealm('u1', 't1')).resolves.toMatchObject({
      ok: false,
      code: 'REALM_NOT_FOUND',
    });
  });
});

describe('setUserHomeRealm', () => {
  it('sends an empty string, never null, to move a user to global', async () => {
    client.post.mockResolvedValueOnce({ data: { _id: 'u1' } });
    await expect(setUserHomeRealm('u1', null, true)).resolves.toEqual({
      ok: true,
      data: { _id: 'u1' },
    });
    expect(client.post).toHaveBeenCalledWith(
      '/authentication/users/u1/home-realm',
      { realmTeamId: '', force: true }
    );
  });

  it('sends the realm team id otherwise', async () => {
    client.post.mockResolvedValueOnce({ data: { _id: 'u1' } });
    await setUserHomeRealm('u1', 't1');
    expect(client.post).toHaveBeenCalledWith(
      '/authentication/users/u1/home-realm',
      { realmTeamId: 't1' }
    );
  });

  it('keys failures on conduitCode, whatever status reaches the wire', async () => {
    client.post.mockRejectedValueOnce(
      failure(500, 'REALM_HAS_HOME_USERS', 'has home users')
    );
    await expect(setUserHomeRealm('u1', 't1')).resolves.toMatchObject({
      ok: false,
      code: 'REALM_HAS_HOME_USERS',
    });
  });
});

describe('team member actions return ActionResult', () => {
  it('addTeamMembers sends the ids and wraps the response', async () => {
    client.post.mockResolvedValueOnce({ data: 'Users added to team' });
    await expect(
      addTeamMembers('t1', [{ _id: 'u1' }, { _id: 'u2' }] as never)
    ).resolves.toEqual({ ok: true, data: 'Users added to team' });
    expect(client.post).toHaveBeenCalledWith(
      '/authentication/teams/t1/members',
      { members: ['u1', 'u2'] }
    );
  });

  it('addTeamMembers returns GUESTS_NOT_ALLOWED instead of throwing', async () => {
    client.post.mockRejectedValueOnce(
      failure(403, 'GUESTS_NOT_ALLOWED', 'Realm does not accept guests')
    );
    await expect(
      addTeamMembers('t1', [{ _id: 'u1' }] as never)
    ).resolves.toEqual({
      ok: false,
      code: 'GUESTS_NOT_ALLOWED',
      message: 'Realm does not accept guests',
      status: 403,
    });
  });

  it('removeTeamMembers returns HOME_USER_REMOVAL instead of throwing', async () => {
    client.delete.mockRejectedValueOnce(
      failure(412, 'HOME_USER_REMOVAL', 'Home users cannot be removed')
    );
    await expect(removeTeamMembers('t1', ['u1'])).resolves.toEqual({
      ok: false,
      code: 'HOME_USER_REMOVAL',
      message: 'Home users cannot be removed',
      status: 412,
    });
    expect(client.delete).toHaveBeenCalledWith(
      '/authentication/teams/t1/members',
      { params: { members: ['u1'] } }
    );
  });

  it('patchTeamMembersRoles wraps success and failure', async () => {
    client.patch
      .mockResolvedValueOnce({ data: 'OK' })
      .mockRejectedValueOnce(failure(404, 'NOT_FOUND', 'Team does not exist'));
    await expect(patchTeamMembersRoles('t1', ['u1'], 'admin')).resolves.toEqual(
      { ok: true, data: 'OK' }
    );
    expect(client.patch).toHaveBeenCalledWith(
      '/authentication/teams/t1/members',
      { members: ['u1'], role: 'admin' }
    );
    await expect(
      patchTeamMembersRoles('t1', ['u1'], 'admin')
    ).resolves.toMatchObject({ ok: false, code: 'NOT_FOUND' });
  });

  it('createUser sends the home realm and returns failures', async () => {
    client.post
      .mockResolvedValueOnce({ data: { _id: 'new' } })
      .mockRejectedValueOnce(failure(409, 'ALREADY_EXISTS', 'Email taken'));
    await expect(
      createUser('a@b.dev', 'secret1', { homeRealm: 'r1' })
    ).resolves.toEqual({ ok: true, data: { _id: 'new' } });
    expect(client.post).toHaveBeenCalledWith('/authentication/users', {
      email: 'a@b.dev',
      password: 'secret1',
      homeRealm: 'r1',
    });
    await expect(createUser('a@b.dev', 'secret1')).resolves.toMatchObject({
      ok: false,
      code: 'ALREADY_EXISTS',
      message: 'Email taken',
    });
  });
});
