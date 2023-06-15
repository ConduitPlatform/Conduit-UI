import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
  putRequest,
} from '../../../http/requestsConfig';
import { EmailData, IEmailConfig, SendEmailData } from '../models/EmailModels';
import { Pagination, Search, Sort } from '../../../models/http/HttpModels';

export const getExternalTemplatesRequest = () => getRequest(`/email/externalTemplates`);

export const getEmailTemplateRequest = (params: Pagination & Search & Sort) =>
  getRequest(`/email/templates`, params);

export const postEmailTemplateRequest = (data: EmailData) =>
  postRequest(`/email/templates`, { ...data });

export const patchEmailTemplateRequest = (templateId: string, data: EmailData) =>
  patchRequest(`/email/templates/${templateId}`, { ...data });

export const deleteEmailTemplateRequest = (ids: string[]) => {
  return deleteRequest(`/email/templates`, { ids: ids.join(',') });
};
export const uploadTemplateRequest = (_id: string) =>
  postRequest(`/email/templates/upload`, {
    _id,
  });

export const syncExternalTemplates = () => putRequest(`/email/syncExternalTemplates`);

export const getEmailSettingsRequest = () => getRequest(`/config/email`);

export const patchEmailSettingsRequest = (data: IEmailConfig) =>
  patchRequest(`/config/email`, { config: { ...data } });

export const sendEmailRequest = (data: SendEmailData) => postRequest(`/email/send`, { ...data });
