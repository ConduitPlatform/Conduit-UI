import { getRequest, postRequest, putRequest } from '../requestsConfig';
import { ISendSms, ISmsConfig } from '../../models/sms/SmsModels';

export const getSmsConfig = () => {
  return getRequest(`/config/sms`);
};

export const putSmsConfig = (data: ISmsConfig) =>
  putRequest(`/config/sms`, {
    config: { ...data },
  });
export const sendSmsRequest = (params: ISendSms) => {
  return postRequest(`/sms/send`, { ...params });
};
