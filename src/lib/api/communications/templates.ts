'use server';

import { getApiClient } from '@/lib/api';
import {
  CommunicationTemplate,
  CommunicationTemplatePayload,
} from '@/lib/models/communications/templates';
import { MigrationResponse } from '@/lib/models/communications/template-row';
import {
  formatCommunicationsApiError,
  getAxiosResponseStatus,
  rethrowNextControlFlowError,
} from '@/lib/logic/api-error';

export type CommunicationTemplateList = {
  templateDocuments: CommunicationTemplate[];
  count: number;
};

export type LoadedCommunicationTemplates =
  | ({ ok: true } & CommunicationTemplateList)
  | { ok: false; status?: number; message: string };

async function withCommunicationsError<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    rethrowNextControlFlowError(err);
    throw new Error(formatCommunicationsApiError(err));
  }
}

export const loadCommunicationTemplates = async (args: {
  skip?: number;
  limit?: number;
  sort?: string;
  search?: string;
}): Promise<LoadedCommunicationTemplates> => {
  try {
    const data = await (
      await getApiClient()
    )
      .get<CommunicationTemplateList>('/communications/templates', {
        params: args,
      })
      .then(res => res.data);
    return { ok: true, ...data };
  } catch (err) {
    rethrowNextControlFlowError(err);
    return {
      ok: false,
      status: getAxiosResponseStatus(err),
      message: formatCommunicationsApiError(err),
    };
  }
};

export const getCommunicationTemplates = async (args: {
  skip?: number;
  limit?: number;
  sort?: string;
  search?: string;
}): Promise<CommunicationTemplateList> => {
  const result = await loadCommunicationTemplates(args);
  if (!result.ok) {
    throw new Error(result.message);
  }
  return {
    templateDocuments: result.templateDocuments,
    count: result.count,
  };
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
