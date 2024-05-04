'use server';
import { axiosInstance } from '@/lib/api';
import { TeamUser, User } from '@/lib/models/User';
import { AuthenticationConfig, AuthenticationConfigResponse } from '@/lib/models/authentication';
import { Team } from '@/lib/models/Team';

export const getUsers = async (skip: number, limit: number, params?: {
  sort?: string,
  search?: string,
  isActive?: boolean,
  provider?: string
}): Promise<{ users: User[], count: number }> => {
  const res = await axiosInstance.get(`/authentication/users`, {
    params: {
      skip,
      limit,
      ...params,
    },
  });
  return res.data;
};

export const createUser = async (email: string, password: string): Promise<User> => {
  const res = await axiosInstance.post(`/authentication/users`, {
    email,
    password,
  });
  return res.data;
};
export const getTeam = async (teamId: string): Promise<Team> => {
  const res = await axiosInstance.get(`/authentication/teams/${teamId}`);
  return res.data;
};
export const getTeams = async (skip: number, limit: number, params?: {
  sort?: string,
  search?: string,
  parentTeam?: string
}): Promise<{ teams: Team[], count: number }> => {
  const res = await axiosInstance.get(`/authentication/teams`, {
    params: {
      skip,
      limit,
      ...params,
    },
  });
  return res.data;
};
export const getTeamMembers = async (teamId: string, skip: number, limit: number, params?: {
  sort?: string,
  search?: string,
}): Promise<{ members: TeamUser[], count: number }> => {
  const res = await axiosInstance.get(`/authentication/teams/${teamId}/members`, {
    params: {
      skip,
      limit,
      ...params,
    },
  });
  return res.data;
};
export const createTeam = async (name: string, params?: {
  isDefault?: boolean,
  parentTeam?: string
}): Promise<Team> => {
  const res = await axiosInstance.post(`/authentication/teams`, {
    name,
    ...params,
  });
  return res.data;
};
export const updateTeam = async (data: { _id: string, name?: string, isDefault?: boolean }): Promise<Team> => {
  const res = await axiosInstance.patch(`/authentication/teams/${data._id}`, {
    ...data,
  });
  return res.data;
};
export const deleteTeam = async (teamId: string) => {
  const res = await axiosInstance.delete(`/authentication/teams/${teamId}`);
  return res.data;
};
export const getAuthenticationSettings = async (): Promise<AuthenticationConfigResponse> => {
  const res = await axiosInstance.get<AuthenticationConfigResponse>('config/authentication');
  return res.data;
};

export const patchAuthenticationSettings = async (data: Partial<AuthenticationConfig>) => {
  await axiosInstance.patch<AuthenticationConfigResponse>(`/config/authentication`, { config: { ...data } });
};
