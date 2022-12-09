import { getRequest, patchRequest, postRequest } from '../../../http/requestsConfig';
import { ISendSms, ISmsConfig } from '../models/SmsModels';

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
