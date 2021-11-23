import axios from 'axios';
import { CONDUIT_API } from './requestsConfig';
import { EmailData, EmailSettings, SendEmailData } from '../models/emails/EmailModels';
import { Pagination, Search } from '../models/http/HttpModels';

export const getExternalTemplatesRequest = () =>
  axios.get(`${CONDUIT_API}/admin/email/externalTemplates`);

export const getEmailTemplateRequest = (params: Pagination & Search) =>
  axios.get(`${CONDUIT_API}/admin/email/templates`, {
    params,
  });

export const postEmailTemplateRequest = (data: EmailData) =>
  axios.post(`${CONDUIT_API}/admin/email/templates`, { ...data });

export const putEmailTemplateRequest = (templateId: string, data: EmailData) =>
  axios.put(`${CONDUIT_API}/admin/email/templates/${templateId}`, { ...data });

export const deleteEmailTemplateRequest = (ids: string[]) => {
  return axios.delete(`${CONDUIT_API}/admin/email/templates`, { data: { ids: ids } });
};
export const uploadTemplateRequest = (_id: string) =>
  axios.post(`${CONDUIT_API}/admin/email/templates/upload`, {
    _id,
  });

export const syncExternalTemplates = () =>
  axios.put(`${CONDUIT_API}/admin/email/syncExternalTemplates`);

export const getEmailSettingsRequest = () => axios.get(`${CONDUIT_API}/admin/config/email`);

export const putEmailSettingsRequest = (data: EmailSettings) =>
  axios.put(`${CONDUIT_API}/admin/config/email`, { ...data });

export const sendEmailRequest = (data: SendEmailData) =>
  axios.post(`${CONDUIT_API}/admin/email/send`, { ...data });
