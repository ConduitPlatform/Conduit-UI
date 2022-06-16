import axios from 'axios';
import { CONDUIT_API } from './requestsConfig';
import { EmailData, IEmailConfig, SendEmailData } from '../models/emails/EmailModels';
import { Pagination, Search, Sort } from '../models/http/HttpModels';

export const getExternalTemplatesRequest = () =>
  axios.get(`${CONDUIT_API}/admin/email/externalTemplates`);

export const getEmailTemplateRequest = (params: Pagination & Search & Sort) =>
  axios.get(`${CONDUIT_API}/admin/email/templates`, {
    params,
  });

export const postEmailTemplateRequest = (data: EmailData) =>
  axios.post(`${CONDUIT_API}/admin/email/templates`, { ...data });

export const patchEmailTemplateRequest = (templateId: string, data: EmailData) =>
  axios.patch(`${CONDUIT_API}/admin/email/templates/${templateId}`, { ...data });

export const deleteEmailTemplateRequest = (ids: string[]) => {
  return axios.delete(`${CONDUIT_API}/admin/email/templates/${ids}`);
};
export const uploadTemplateRequest = (_id: string) =>
  axios.post(`${CONDUIT_API}/admin/email/templates/upload`, {
    _id,
  });

export const syncExternalTemplates = () =>
  axios.put(`${CONDUIT_API}/admin/email/syncExternalTemplates`);

export const getEmailSettingsRequest = () => axios.get(`${CONDUIT_API}/admin/config/email`);

export const putEmailSettingsRequest = (data: IEmailConfig) =>
  axios.put(`${CONDUIT_API}/admin/config/email`, { config: { ...data } });

export const sendEmailRequest = (data: SendEmailData) =>
  axios.post(`${CONDUIT_API}/admin/email/send`, { ...data });
