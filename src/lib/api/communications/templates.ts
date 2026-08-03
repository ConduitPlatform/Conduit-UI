'use server';

import { getApiClient } from '@/lib/api';
import {
  CommunicationTemplate,
  CommunicationTemplatePayload,
} from '@/lib/models/communications/templates';
import { MigrationResponse } from '@/lib/models/communications/template-row';
import {
  formatCommunicationsApiError,
  isNextNavigationError,
} from '@/lib/logic/api-error';

async function withCommunicationsError<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (isNextNavigationError(err)) throw err;
    throw new Error(formatCommunicationsApiError(err));
  }
}

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
  return withCommunicationsError(async () =>
    (await getApiClient())
      .get<Response>('/communications/templates', { params: args })
      .then(res => res.data)
  );
};

export const getCommunicationTemplate = async (id: string) => {
  return withCommunicationsError(async () =>
    (await getApiClient())
      .get<{
        template: CommunicationTemplate;
      }>(`/communications/templates/${id}`)
      .then(res => res.data.template)
  );
};

export const createCommunicationTemplate = async (
  data: CommunicationTemplatePayload
) => {
  return withCommunicationsError(async () =>
    (await getApiClient())
      .post<{
        template: CommunicationTemplate;
      }>('/communications/templates', data)
      .then(res => res.data.template)
  );
};

export const updateCommunicationTemplate = async (
  id: string,
  data: Partial<CommunicationTemplatePayload>
) => {
  return withCommunicationsError(async () =>
    (await getApiClient())
      .patch<{
        template: CommunicationTemplate;
      }>(`/communications/templates/${id}`, data)
      .then(res => res.data.template)
  );
};

export const deleteCommunicationTemplate = async (id: string) => {
  return withCommunicationsError(async () =>
    (await getApiClient())
      .delete<{ deleted: boolean }>(`/communications/templates/${id}`)
      .then(res => res.data)
  );
};

export const migrateFromEmailTemplate = async (options: {
  emailTemplateId?: string;
  dryRun?: boolean;
  skipExisting?: boolean;
  deleteSource?: boolean;
}) => {
  return withCommunicationsError(async () =>
    (await getApiClient())
      .post<MigrationResponse>(
        '/communications/templates/migrate-from-email',
        options
      )
      .then(res => res.data)
  );
};
