import { getRequest, patchRequest, postRequest } from '../requestsConfig';
import { ISendSms, ISmsConfig } from '../../models/sms/SmsModels';

export const getSmsConfig = () => {
  return getRequest(`/config/sms`);
};

export const patchSmsConfig = (data: ISmsConfig) =>
  patchRequest(`/config/sms`, {
    config: { ...data },
  });
export const sendSmsRequest = (params: ISendSms) => {
  return postRequest(`/sms/send`, { ...params });
};
