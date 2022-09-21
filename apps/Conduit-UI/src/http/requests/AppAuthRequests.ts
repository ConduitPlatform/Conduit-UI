import { postRequest } from '../requestsConfig';

export const loginRequest = (username: string, password: string) =>
  postRequest(`/login`, {
    username,
    password,
  });

export const verifyQrCodeRequest = () => postRequest('/verify-qr-code', { code: '' });

export const verifyTwoFARequest = () => postRequest('/verify-twofa', { code: '' });
