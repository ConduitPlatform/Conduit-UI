'use server';
import merge from 'lodash/merge';
import { getApiClient } from '@/lib/api';
import { TeamUser, User } from '@/lib/models/User';
import {
  AuthenticationConfig,
  AuthenticationConfigResponse,
} from '@/lib/models/authentication';
import { Team } from '@/lib/models/Team';
import { TeamInvite } from '@/lib/models/TeamInvite';

export const getUsers = async (
  skip: number,
  limit: number,
  params?: {
    sort?: string;
    search?: string;
    isActive?: boolean;
    provider?: string;
  }
): Promise<{ users: User[]; count: number }> => {
  const res = await (
    await getApiClient()
  ).get(`/authentication/users`, {
    params: {
      skip,
      limit,
      ...params,
    },
  });
  return res.data;
};

export const createUser = async (
  email: string,
  password: string
): Promise<User> => {
  const res = await (
    await getApiClient()
  ).post(`/authentication/users`, {
    email,
    password,
  });
  return res.data;
};
export const deleteUser = async (userId: string): Promise<string> => {
  const res = await (
    await getApiClient()
  ).delete(`/authentication/users/${userId}`);
  return res.data;
};
export const blockUnblockUser = async (
  userId: string,
  block: boolean
): Promise<string> => {
  const res = await (
    await getApiClient()
  ).post(`/authentication/users/${userId}/${block ? 'block' : 'unblock'}`);
  return res.data;
};
export const getTeam = async (teamId: string): Promise<Team> => {
  const res = await (
    await getApiClient()
  ).get(`/authentication/teams/${teamId}`);
  return res.data;
};
export const getTeams = async (
  skip: number,
  limit: number,
  params?: {
    sort?: string;
    search?: string;
    parentTeam?: string;
  }
): Promise<{ teams: Team[]; count: number }> => {
  const res = await (
    await getApiClient()
  ).get(`/authentication/teams`, {
    params: {
      skip,
      limit,
      ...params,
    },
  });
  return res.data;
};
export const getTeamMembers = async (
  teamId: string,
  skip: number,
  limit: number,
  params?: {
    sort?: string;
    search?: string;
  }
): Promise<{ members: TeamUser[]; count: number }> => {
  const res = await (
    await getApiClient()
  ).get(`/authentication/teams/${teamId}/members`, {
    params: {
      skip,
      limit,
      ...params,
    },
  });
  return res.data;
};
export const addTeamMembers = async (
  teamId: string,
  members: User[]
): Promise<{
  members: TeamUser[];
  count: number;
}> => {
  const res = await (
    await getApiClient()
  ).post(`/authentication/teams/${teamId}/members`, {
    members: members.map(member => member._id),
  });
  return res.data;
};
export const createTeam = async (
  name: string,
  params?: {
    isDefault?: boolean;
    parentTeam?: string;
  }
): Promise<Team> => {
  const res = await (
    await getApiClient()
  ).post(`/authentication/teams`, {
    name,
    ...params,
  });
  return res.data;
};
export const updateTeam = async (data: {
  _id: string;
  name?: string;
  isDefault?: boolean;
}): Promise<Team> => {
  const res = await (
    await getApiClient()
  ).patch(`/authentication/teams/${data._id}`, {
    ...data,
  });
  return res.data;
};
export const deleteTeam = async (teamId: string) => {
  const res = await (
    await getApiClient()
  ).delete(`/authentication/teams/${teamId}`);
  return res.data;
};
export const getAuthenticationSettings =
  async (): Promise<AuthenticationConfigResponse> => {
    const res = await (
      await getApiClient()
    ).get<AuthenticationConfigResponse>('config/authentication');
    return res.data;
  };

export const patchAuthenticationSettings = async (
  data: Partial<AuthenticationConfig>
) => {
  await (
    await getApiClient()
  ).patch<AuthenticationConfigResponse>(`/config/authentication`, {
    config: { ...data },
  });
};

/** Read–modify–write: merges `partial` into current config before PATCH (safe for strategy-only updates). */
export const patchAuthenticationSettingsMerged = async (
  partial: Partial<AuthenticationConfig>
) => {
  const { config } = await getAuthenticationSettings();
  const merged = merge({}, config, partial) as AuthenticationConfig;
  await patchAuthenticationSettings(merged);
};

export const patchUser = async (
  userId: string,
  data: Partial<{
    email: string;
    isVerified: boolean;
    hasTwoFA: boolean;
    phoneNumber: string;
    twoFaMethod: string;
  }>
) => {
  const res = await (
    await getApiClient()
  ).patch<User>(`/authentication/users/${userId}`, data);
  return res.data;
};

export const deleteUsers = async (ids: string[]) => {
  const res = await (
    await getApiClient()
  ).delete<string>('/authentication/users', { params: { ids } });
  return res.data;
};

export const toggleUsersBlock = async (ids: string[], block: boolean) => {
  const res = await (
    await getApiClient()
  ).post<string>('/authentication/users/toggle', { ids, block });
  return res.data;
};

export const removeTeamMembers = async (
  teamId: string,
  memberIds: string[]
) => {
  const res = await (
    await getApiClient()
  ).delete<string>(`/authentication/teams/${teamId}/members`, {
    params: { members: memberIds },
  });
  return res.data;
};

export const patchTeamMembersRoles = async (
  teamId: string,
  memberIds: string[],
  role: string
) => {
  const res = await (
    await getApiClient()
  ).patch<string>(`/authentication/teams/${teamId}/members`, {
    members: memberIds,
    role,
  });
  return res.data;
};

export const getTeamInvites = async (
  teamId: string,
  skip: number,
  limit: number
): Promise<{ invites: TeamInvite[]; count: number }> => {
  const res = await (
    await getApiClient()
  ).get(`/authentication/teams/${teamId}/invites`, {
    params: { skip, limit },
  });
  return res.data;
};

export const createPersistentInvite = async (
  teamId: string,
  role: string,
  userData?: Record<string, unknown>
): Promise<string> => {
  const res = await (
    await getApiClient()
  ).post<{ result: string }>(
    `/authentication/teams/${teamId}/invite/persistent`,
    {
      role,
      userData,
    }
  );
  return res.data.result;
};

export const deletePersistentInvite = async (
  teamId: string,
  invitationToken: string
): Promise<string> => {
  const res = await (
    await getApiClient()
  ).delete<{ result: string }>(
    `/authentication/teams/${teamId}/invite/persistent`,
    {
      params: { invitationToken },
    }
  );
  return res.data.result;
};
