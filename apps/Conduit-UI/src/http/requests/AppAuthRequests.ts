import { postRequest } from '../requestsConfig';

export const loginRequest = (username: string, password: string) =>
  postRequest(`/admin/login`, {
    username,
    password,
  });
