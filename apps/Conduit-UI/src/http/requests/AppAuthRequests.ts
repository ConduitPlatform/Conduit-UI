import { postRequest } from '../requestsConfig';

export const loginRequest = (username: string, password: string) =>
  postRequest(`/login`, {
    username,
    password,
  });
