import axios from 'axios';
import { CONDUIT_API, config } from './requestsConfig';

export const loginRequest = (username: string, password: string) =>
  axios.post(
    // `${CONDUIT_API}/admin/login`,
    `/api/auth/login`,
    {
      username,
      password,
    },
    { headers: config }
  );
