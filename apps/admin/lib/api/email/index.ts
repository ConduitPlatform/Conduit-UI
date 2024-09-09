'use server';
import { axiosInstance } from '@/lib/api';
import {
  EmailConfigResponse,
  EmailSettings,
  EmailTemplate,
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
  return await axiosInstance
    .get<Response>('/email/templates', { params: args })
    .then(res => res.data);
};

export const createTemplate = async (data: {
  name: string;
  subject: string;
  body: string;
  sender?: string;
  externalManaged?: boolean;
  _id?: string; // externally managed
}) => {
  return await axiosInstance
    .post<EmailTemplate>('/email/templates', data)
    .then(res => res.data);
};

export const deleteTemplates = async (ids: string[]) => {
  return await axiosInstance
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
  args: {
    name?: string;
    subject?: string;
    body?: string;
  }
) => {
  return await axiosInstance
    .put<EmailTemplate>(`/email/templates/${templateId}`, {
      ...args,
    })
    .then(res => res.data);
};
