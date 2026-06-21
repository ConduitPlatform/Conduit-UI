'use server';
import { getApiClient } from '@/lib/api';
import {
  EmailConfigResponse,
  EmailPayload,
  EmailRecord,
  EmailSettings,
  EmailTemplate,
  ExternalTemplate,
} from '@/lib/models/email';
import { afterPatchServing } from '@/lib/api/modules/afterPatchServing';
import { PatchSettingsOptions } from '@/lib/api/modules/patch-settings-options';
import { CommunicationsConfigResponse } from '@/lib/models/communications';
import {
  extractModuleConfigFromCommunications,
  buildCommunicationsPatchPayload,
} from '@/lib/utils/config-utils';

export const getEmailSettings = async (): Promise<EmailConfigResponse> => {
  const res = await (
    await getApiClient()
  ).get<CommunicationsConfigResponse>('/config/communications');
  const emailConfig = extractModuleConfigFromCommunications<EmailSettings>(
    res.data.config,
    'email'
  );
  return { config: emailConfig };
};

export const patchEmailSettings = async (
  data: Partial<EmailSettings>,
  options?: PatchSettingsOptions
) => {
  await (
    await getApiClient()
  ).patch<CommunicationsConfigResponse>(
    '/config/communications',
    buildCommunicationsPatchPayload('email', data)
  );

  return afterPatchServing(options);
};

export const getTemplates = async (args: {
  skip?: number;
  limit?: number;
  sort?: string;
  search?: string;
}) => {
  type Response = {
    templateDocuments: EmailTemplate[];
    count: number;
  };
  return (await getApiClient())
    .get<Response>('/email/templates', { params: args })
    .then(res => res.data);
};

export const createTemplate = async (data: {
  name: string;
  subject: string;
  body: string;
  sender?: string;
  externalManaged?: boolean;
  jsonTemplate?: string;
  _id?: string; // externally managed
}) => {
  return (await getApiClient())
    .post<{ template: EmailTemplate }>('/email/templates', data)
    .then(res => res.data);
};

export const deleteTemplates = async (ids: string[]) => {
  await Promise.all(ids.map(id => deleteTemplate(id)));
};

export const deleteTemplate = async (id: string) => {
  await (await getApiClient())
    .delete<any>(`/email/templates/${id}`)
    .then(res => res.data);
};

export const patchTemplates = async (
  templateId: string,
  data: {
    name?: string;
    subject?: string;
    body?: string;
    sender?: string;
    jsonTemplate?: any;
  }
) => {
  return (await getApiClient())
    .patch<EmailTemplate>(`/email/templates/${templateId}`, data)
    .then(res => res.data);
};

export const getExternalTemplates = async (args: {
  skip?: number;
  limit?: number;
  sortByName?: boolean;
}) => {
  type Response = {
    templateDocuments: ExternalTemplate[];
    count: number;
  };
  return (await getApiClient())
    .get<Response>('/email/templates/external', { params: args })
    .then(res => res.data);
};

export const syncTemplates = async () => {
  type Response = {
    updated: EmailTemplate[];
    count: number;
  };
  return (await getApiClient())
    .post<Response>('/email/templates/external/sync')
    .then(res => res.data);
};

export const uploadTemplate = async (_id: string) => {
  throw new Error(
    'Template upload to the email provider is not available on the unified communications module'
  );
};

export const sendEmail = async (data: EmailPayload) => {
  return (await getApiClient()).post(`/email/send`, data).then(res => res.data);
};

export const reSendEmail = async (emailRecordId: string) => {
  return (await getApiClient())
    .post(`/email/resend`, { id: emailRecordId })
    .then(res => res.data);
};

const resolveEmailListSearch = (args: {
  messageId?: string;
  templateId?: string;
  receiver?: string;
  sender?: string;
}): string | undefined => {
  if (args.receiver) return args.receiver;
  if (args.messageId?.match(/^[a-fA-F\d]{24}$/)) return args.messageId;
  if (args.templateId?.match(/^[a-fA-F\d]{24}$/)) return args.templateId;
  if (args.sender) return args.sender;
  return args.messageId;
};

export const fetchRecords = async (args: {
  skip: number;
  limit: number;
  messageId?: string;
  templateId?: string;
  receiver?: string;
  sender?: string;
  cc?: string[];
  replyTo?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
}) => {
  type Response = {
    emailDocuments: EmailRecord[];
    count: number;
  };
  const search = resolveEmailListSearch(args);
  const res = await (
    await getApiClient()
  ).get<Response>('/email/emails', {
    params: {
      skip: args.skip,
      limit: args.limit,
      sort: args.sort,
      ...(search ? { search } : {}),
    },
  });
  return { records: res.data.emailDocuments, count: res.data.count };
};
