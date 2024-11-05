'use server';
import { axiosInstance } from '@/lib/api';
import {
  EmailConfigResponse,
  EmailPayload,
  EmailSettings,
  EmailTemplate,
  ExternalTemplate,
} from '@/lib/models/email';
import { getModules } from '@/lib/api/modules';

export const getEmailSettings = async () => {
  const res = await axiosInstance.get<EmailConfigResponse>('config/email');
  return res.data;
};

export const patchEmailSettings = async (data: Partial<EmailSettings>) => {
  await axiosInstance.patch<EmailConfigResponse>(`/config/email`, {
    config: { ...data },
  });
  return new Promise<Awaited<ReturnType<typeof getModules>>>(
    async (resolve, reject) => {
      setTimeout(async () => {
        try {
          const modules = await getModules();
          resolve(modules);
        } catch (error) {
          reject(error);
        }
      }, 3000);
    }
  );
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
  return axiosInstance
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
  return axiosInstance
    .post<{ template: EmailTemplate }>('/email/templates', data)
    .then(res => res.data);
};

export const deleteTemplates = async (ids: string[]) => {
  return axiosInstance
    .delete<string>('/email/templates', { params: { ids } })
    .then(res => res.data);
};

export const deleteTemplate = async (id: string) => {
  await axiosInstance
    .delete<any>(`/email/templates/${id}`)
    .then(res => res.data);
};

export const patchTemplates = async (
  templateId: string,
  data: {
    name?: string;
    subject?: string;
    body?: string;
    jsonTemplate?: any;
  }
) => {
  return axiosInstance
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
  return axiosInstance
    .get<Response>('/email/externalTemplates', { params: args })
    .then(res => res.data);
};

export const syncTemplates = async () => {
  type Response = {
    updated: EmailTemplate[];
    count: number;
  };
  return axiosInstance
    .put<Response>('/email/syncExternalTemplates')
    .then(res => res.data);
};

export const uploadTemplate = async (id: string) => {
  return axiosInstance
    .post('/email/templates/upload', { _id: id })
    .then(res => res.data)
    .catch(err => {
      throw new Error(err.response?.data.message ?? err.message);
    });
};

export const sendEmail = async (data: EmailPayload) => {
  return axiosInstance.post(`/email/send`, data).then(res => res.data);
};
