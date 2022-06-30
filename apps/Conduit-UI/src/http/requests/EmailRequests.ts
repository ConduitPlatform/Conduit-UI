import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
  putRequest,
} from '../requestsConfig';
import { EmailData, IEmailConfig, SendEmailData } from '../../models/emails/EmailModels';
import { Pagination, Search, Sort } from '../../models/http/HttpModels';

export const getExternalTemplatesRequest = () => getRequest(`/admin/email/externalTemplates`);

export const getEmailTemplateRequest = (params: Pagination & Search & Sort) =>
  getRequest(`/admin/email/templates`, {
    params,
  });

export const postEmailTemplateRequest = (data: EmailData) =>
  postRequest(`/admin/email/templates`, { ...data });

export const patchEmailTemplateRequest = (templateId: string, data: EmailData) =>
  patchRequest(`/admin/email/templates/${templateId}`, { ...data });

export const deleteEmailTemplateRequest = (ids: string[]) => {
  return deleteRequest(`/admin/email/templates/${ids}`);
};
export const uploadTemplateRequest = (_id: string) =>
  postRequest(`/admin/email/templates/upload`, {
    _id,
  });

export const syncExternalTemplates = () => putRequest(`/admin/email/syncExternalTemplates`);

export const getEmailSettingsRequest = () => getRequest(`/admin/config/email`);

export const putEmailSettingsRequest = (data: IEmailConfig) =>
  putRequest(`/admin/config/email`, { config: { ...data } });

export const sendEmailRequest = (data: SendEmailData) =>
  postRequest(`/admin/email/send`, { ...data });
