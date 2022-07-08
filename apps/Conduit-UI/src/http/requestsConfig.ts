import axios from 'axios';
import { getCurrentStore } from '../redux/store';
import { asyncLogout } from '../redux/slices/appAuthSlice';
import { sanitizeRequestParams } from '../utils/sanitizeRequestParams';

/**
 * We no longer include the masterkey in our requests
 * since we are targeting the proxy server instead which
 * will add it itself.
 * */

// export const config = {
//   masterkey: process.env.IS_DEV ? process.env.MASTER_KEY : MASTER_KEY,
// };

const _axios = axios.create({
  baseURL: '', //localhost
  timeoutErrorMessage: 'Request took long to complete, times up!',
});

const JWT_CONFIG = (token: string) => ({
  // ...config,
  Authorization: `JWT ${token}`,
});

_axios.interceptors.request.use(
  (config) => {
    const reduxStore = getCurrentStore();
    const token = reduxStore.getState().appAuthSlice.data.token;

    if (token) {
      config.headers = JWT_CONFIG(token);
    }

    if (config.params) {
      config.params = sanitizeRequestParams(config.params);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error.response);
  }
);

_axios.interceptors.response.use(
  (config) => {
    return config;
  },
  (error) => {
    if (error.response.status === 401) {
      const reduxStore = getCurrentStore();
      if (reduxStore) {
        reduxStore.dispatch(asyncLogout());
      }
    }
    return Promise.reject(error.response);
  }
);

/**
 * All the functions bellow use localhost/api/endpoint path which
 * target the proxy server
 * */

export const postRequest = (endpoint: string, body?: any, config?: any): Promise<any> => {
  return _axios.post('/api' + endpoint, { ...body }, { ...config });
};

export const putRequest = (endpoint: string, body?: any): Promise<any> => {
  return _axios.put('/api' + endpoint, { ...body });
};

export const patchRequest = (endpoint: string, body?: any): Promise<any> => {
  return _axios.patch('/api' + endpoint, { ...body });
};

export const getRequest = (endpoint: string, params?: any): Promise<any> => {
  return _axios.get('/api' + endpoint, { params });
};

export const deleteRequest = (endpoint: string, params?: any): Promise<any> => {
  return _axios.delete('/api' + endpoint, { params });
};
