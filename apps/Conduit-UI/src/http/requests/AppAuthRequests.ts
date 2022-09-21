import { postRequest } from '../requestsConfig';

export const loginRequest = (username: string, password: string) =>
  postRequest(`/login`, {
    username,
    password,
  });

export const verifyQrCodeRequest = (code: string) => postRequest('/verify-qr-code', { code });

export const verifyTwoFARequest = (code: string) => postRequest('/verify-twofa', { code });
