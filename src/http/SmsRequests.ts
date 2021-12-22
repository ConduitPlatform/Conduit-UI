import axios from 'axios';
import { CONDUIT_API } from './requestsConfig';
import { ISmsConfig } from '../models/sms/SmsModels';

export const getSmsConfig = () => {
  return axios.get(`${CONDUIT_API}/admin/config/sms`);
};

export const putSmsConfig = (data: ISmsConfig) =>
  axios.put(`${CONDUIT_API}/admin/config/sms`, {
    config: { ...data },
  });
export const sendSmsRequest = () => {
  return axios.post(`${CONDUIT_API}/admin/sms/send`);
};
