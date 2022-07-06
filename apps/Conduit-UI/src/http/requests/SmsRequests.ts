import { getRequest, postRequest, putRequest } from '../requestsConfig';
import { ISendSms, ISmsConfig } from '../../models/sms/SmsModels';

export const getSmsConfig = () => {
  return getRequest(`/admin/config/sms`);
};

export const putSmsConfig = (data: ISmsConfig) =>
  putRequest(`/admin/config/sms`, {
    config: { ...data },
  });
export const sendSmsRequest = (params: ISendSms) => {
  return postRequest(`/admin/sms/send`, { ...params });
};
