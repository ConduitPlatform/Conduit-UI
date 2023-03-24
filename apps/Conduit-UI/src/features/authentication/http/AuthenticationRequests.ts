import { deleteRequest, getRequest, patchRequest, postRequest } from '../../../http/requestsConfig';
import { AuthTeamFields, AuthUser } from '../models/AuthModels';
import { Pagination, Search, Sort } from '../../../models/http/HttpModels';

export const getUsers = (params: Pagination & Search & { provider?: string } & Sort) =>
  getRequest(`/authentication/users`, params);

export const createUser = (values: { email: string; password: string }) =>
  postRequest(`/authentication/users`, {
    email: values.email,
    password: values.password,
  });

export const editUser = (values: AuthUser) =>
  patchRequest(`/authentication/users/${values._id}`, {
    ...values,
  });

export const deleteUsers = (ids: string[]) => {
  return deleteRequest(`/authentication/users`, { ids });
};

export const blockUser = (id: string) => {
  return postRequest(`/authentication/users/${id}/block`);
};

export const blockUnblockUsers = (body: { ids: string[]; block: boolean }) => {
  return postRequest(`/authentication/users/toggle`, body);
};

export const unblockUser = (id: string) => {
  return postRequest(`/authentication/users/${id}/unblock`);
};

export const getTeams = (params: Pagination & Search & { parentTeam?: string } & Sort) =>
  getRequest(`/authentication/teams`, params);

export const createTeam = (values: { name: string; isDefault: boolean; parentTeam?: string }) =>
  postRequest(`/authentication/teams`, {
    name: values.name,
    isDefault: values.isDefault,
    parentTeam: values.parentTeam,
  });

export const editTeam = ({ _id, ...params }: { _id: string } & AuthTeamFields) =>
  patchRequest(`/authentication/teams/${_id}`, {
    ...params,
  });

export const deleteTeam = (id: string) => deleteRequest(`/authentication/teams/${id}`);

export const getTeamMembers = ({ _id, ...params }: Pagination & Search & { _id: string } & Sort) =>
  getRequest(`/authentication/teams/${_id}/members`, params);

export const addTeamMembers = ({ _id, ...values }: { _id: string; members: string[] }) =>
  postRequest(`/authentication/teams/${_id}/members`, {
    members: values.members,
  });

export const editTeamMembers = ({
  _id,
  ...values
}: {
  _id: string;
  members: string[];
  role: string;
}) =>
  patchRequest(`/authentication/teams/${_id}/members`, {
    members: values.members,
    role: values.role,
  });

export const deleteTeamMembers = ({ _id, ...values }: { _id: string; members: string[] }) =>
  deleteRequest(`/authentication/teams/${_id}/members`, {
    members: values.members,
  });

export const getAuthenticationConfig = () => getRequest(`/config/authentication`);

export const patchAuthenticationConfig = (body: any) =>
  patchRequest(`/config/authentication`, { config: { ...body } });
