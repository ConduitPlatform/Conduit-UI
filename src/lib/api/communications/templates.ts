'use server';

import { getApiClient } from '@/lib/api';
import {
  CommunicationTemplate,
  CommunicationTemplatePayload,
} from '@/lib/models/communications/templates';

export const getCommunicationTemplates = async (args: {
  skip?: number;
  limit?: number;
  sort?: string;
  search?: string;
}) => {
  type Response = {
    templateDocuments: CommunicationTemplate[];
    count: number;
  };
  return (await getApiClient())
    .get<Response>('/communications/templates', { params: args })
    .then(res => res.data);
};

export const getCommunicationTemplate = async (id: string) => {
  return (await getApiClient())
    .get<{ template: CommunicationTemplate }>(`/communications/templates/${id}`)
    .then(res => res.data.template);
};

export const createCommunicationTemplate = async (
  data: CommunicationTemplatePayload
) => {
  return (await getApiClient())
    .post<{
      template: CommunicationTemplate;
    }>('/communications/templates', data)
    .then(res => res.data.template);
};

export const updateCommunicationTemplate = async (
  id: string,
  data: Partial<CommunicationTemplatePayload>
) => {
  return (await getApiClient())
    .patch<{
      template: CommunicationTemplate;
    }>(`/communications/templates/${id}`, data)
    .then(res => res.data.template);
};

export const deleteCommunicationTemplate = async (id: string) => {
  return (await getApiClient())
    .delete<{ deleted: boolean }>(`/communications/templates/${id}`)
    .then(res => res.data);
};

export const migrateFromEmailTemplate = async (options: {
  emailTemplateId?: string;
  dryRun?: boolean;
  skipExisting?: boolean;
  deleteSource?: boolean;
}) => {
  return (await getApiClient())
    .post('/communications/templates/migrate-from-email', options)
    .then(res => res.data);
};
