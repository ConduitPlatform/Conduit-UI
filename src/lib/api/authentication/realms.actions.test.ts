import { AxiosError, type AxiosResponse } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const client = vi.hoisted(() => ({
  delete: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ getApiClient: async () => client }));

import {
  addRealmGuests,
  demoteRealm,
  promoteTeamToRealm,
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
