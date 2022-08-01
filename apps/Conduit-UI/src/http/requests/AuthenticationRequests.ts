import {
  deleteRequest,
  getRequest,
  getRequestLoki,
  patchRequest,
  postRequest,
} from '../requestsConfig';
import { AuthUser } from '../../models/authentication/AuthModels';
import { Pagination, Search, Sort } from '../../models/http/HttpModels';

export const getAuthUsersDataReq = (params: Pagination & Search & { provider: string } & Sort) =>
  getRequest(`/authentication/users`, { params });

export const createNewUsers = (values: { email: string; password: string }) =>
  postRequest(`/authentication/users`, {
    email: values.email,
    password: values.password,
  });

export const editUser = (values: AuthUser) =>
  patchRequest(`/authentication/users/${values._id}`, {
    ...values,
  });

export const deleteUsers = (ids: string[]) => {
  return deleteRequest(`/authentication/users`, { data: { ids } });
};

export const searchUser = (identifier: string) => {
  return getRequest(`/authentication/users`, {
    params: {
      identifier: identifier,
    },
  });
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

export const getAuthenticationConfig = () => getRequest(`/config/authentication`);

export const patchAuthenticationConfig = (body: any) =>
  patchRequest(`/config/authentication`, { config: { ...body } });

export const getAuthenticationLogsLevels = (body: any) =>
  getRequestLoki(`/loki/api/v1/label/level/values`, {
    start: body,
  });

export const getAuthenticationLogsInstances = () =>
  getRequestLoki(`/loki/api/v1/label/instance/values`, {});

export const getAuthenticationLogsInstancesModules = () =>
  getRequestLoki(`/loki/api/v1/label/module/values`, {});

export const getAuthenticationLogsQuery = (module: string) =>
  getRequestLoki(`/loki/api/v1/query`, {
    query: `{module="${module}"}`,
  });

export const getAuthenticationLogsQueryRange = (body: {
  query: string;
  startDate: any;
  endDate: any;
}) =>
  getRequestLoki(`/loki/api/v1/query_range`, {
    query: body.query,
    start: body.startDate,
    end: body.endDate,
    limit: 100,
  });

export const getAuthenticationLogs = () => getRequestLoki(`/loki/api/v1/status/buildinfo`, {});
