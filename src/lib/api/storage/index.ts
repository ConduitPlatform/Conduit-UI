'use server';
import { getApiClient } from '@/lib/api';
import { StorageSettings } from '@/lib/models/storage/settings';
import { afterPatchServing } from '@/lib/api/modules/afterPatchServing';
import { PatchSettingsOptions } from '@/lib/api/modules/patch-settings-options';
import {
  ConduitFile,
  Container,
  Folder,
  StorageConfigResponse,
} from '@/lib/models/storage';

export const getStorageSettings = async () => {
  const res = await (
    await getApiClient()
  ).get<StorageConfigResponse>(`/config/storage`);
  return res.data;
};

export const patchStorageSettings = async (
  storageData: Partial<StorageSettings>,
  options?: PatchSettingsOptions
) => {
  await (
    await getApiClient()
  ).patch<StorageConfigResponse>(`/config/storage`, {
    config: { ...storageData },
  });
  return afterPatchServing(options);
};

export const getContainers = async (args: {
  skip: number;
  limit: number;
  sort?: string;
}) => {
  type Response = {
    containers: Container[];
    containersCount: number;
  };
  return await (await getApiClient())
    .get<Response>('/storage/containers', { params: args })
    .then(res => res.data);
};

export const createContainer = async (data: {
  name: string;
  isPublic?: boolean;
}) => {
  return await (await getApiClient())
    .post<Container>('/storage/containers', data)
    .then(res => res.data);
};

export const deleteContainer = async (id: string) => {
  return await (await getApiClient())
    .delete<string>(`/storage/containers/${id}`)
    .then(res => res.data);
};

export const getFolders = async (args: {
  skip?: number;
  limit?: number;
  sort?: string;
  container?: string;
  parent?: string;
  search?: string;
}) => {
  type Response = {
    folders: Folder[];
    folderCount: number;
  };
  return await (await getApiClient())
    .get<Response>('/storage/folders', { params: args })
    .then(res => res.data);
};

export const createFolder = async (data: {
  name: string;
  container: string;
  isPublic?: boolean;
}) => {
  return await (await getApiClient())
    .post<Folder>('/storage/folders', data)
    .then(res => res.data);
};

export const deleteFolder = async (id: string) => {
  return await (await getApiClient())
    .delete<string>(`/storage/folders/${id}`)
    .then(res => res.data);
};

export const getFiles = async (args: {
  skip: number;
  limit: number;
  container: string;
  sort?: string;
  search?: string;
  folder?: string;
}) => {
  type Response = {
    files: ConduitFile[];
    filesCount: number;
  };
  return await (await getApiClient())
    .get<Response>('/storage/files', { params: args })
    .then(res => res.data);
};

export const getFileById = async (id: string) => {
  return await (await getApiClient())
    .get<ConduitFile>(`/storage/files/${id}`)
    .then(res => res.data);
};

export const deleteFileById = async (id: string) => {
  return await (await getApiClient())
    .delete<string>(`/storage/files/${id}`)
    .then(res => res.data);
};

export const createFile = async (data: {
  data: string;
  name?: string;
  alias?: string;
  folder?: string;
  container?: string;
  mimeType?: string;
  isPublic?: string;
}) => {
  return await (await getApiClient())
    .post<ConduitFile>('/storage/files', data)
    .then(res => res.data);
};

export const fileUpload = async (data: {
  mimeType: string;
  isPublic: boolean;
  name?: string;
  alias?: string;
  folder?: string;
  size?: number;
  container?: string;
}) => {
  type Response = {
    file: ConduitFile;
    url: string;
  };
  return await (await getApiClient())
    .post<Response>('/storage/files/upload', data)
    .then(res => res.data);
};

export const patchFileUpload = async (
  id: string,
  data: {
    name?: string;
    alias?: string;
    folder?: string;
    container?: string;
    mimeType?: string;
    size?: number;
  }
) => {
  type Response = {
    file: ConduitFile;
    url: string;
  };
  return await (await getApiClient())
    .patch<Response>(`/storage/files/upload/${id}`, data)
    .then(res => res.data);
};

export const getFileUrl = async (id: string, args?: { redirect?: boolean }) => {
  return await (
    await getApiClient()
  )
    .get<{
      result: string;
      redirect?: boolean;
    }>(`/storage/files/${id}/url`, { params: args })
    .then(res => res.data);
};
