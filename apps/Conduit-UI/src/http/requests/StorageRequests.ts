import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
  putRequest,
} from '../requestsConfig';
import { IStorageConfig } from '../../models/storage/StorageModels';
import {
  ICreateStorageContainer,
  ICreateStorageFile,
  ICreateStorageFolder,
  IDeleteStorageContainer,
  IDeleteStorageFolder,
  IGetStorageContainers,
  IGetStorageFiles,
  IGetStorageFolders,
} from '../../models/storage/StorageRequestsModels';

export const getStorageSettings = () => getRequest(`/admin/config/storage`);

export const putStorageSettings = (storageData: IStorageConfig) =>
  putRequest(`/admin/config/storage`, {
    config: {
      ...storageData,
    },
  });

export const getStorageContainers = (params: IGetStorageContainers) =>
  getRequest(`/admin/storage/containers`, {
    params: {
      ...params,
    },
  });

export const getStorageFolders = (folderData: IGetStorageFolders) =>
  getRequest(`/admin/storage/folders`, {
    params: {
      ...folderData,
    },
  });

export const getStorageFiles = (fileData: IGetStorageFiles) =>
  getRequest(`/admin/storage/files`, {
    params: {
      ...fileData,
    },
  });

export const getStorageFile = (id: string) => getRequest(`/admin/storage/files/${id}/data`);

export const getStorageFileUrl = (id: string, redirect: boolean) =>
  getRequest(`/admin/storage/files/${id}/url`, {
    params: {
      redirect: false,
    },
  });

// export const updateStorageFile = (fileData: IStorageFile) =>
export const updateStorageFile = (
  fileData: any //not working
) => patchRequest(`/admin/storage/files/${fileData.id}`, { ...fileData });

export const createStorageFile = (fileData: ICreateStorageFile) =>
  postRequest(`/admin/storage/files`, { ...fileData });

export const createStorageFolder = (folderData: ICreateStorageFolder) =>
  postRequest(`/admin/storage/folders`, { ...folderData });

export const createStorageContainer = (containerData: ICreateStorageContainer) =>
  postRequest(`/admin/storage/containers`, { ...containerData });

export const deleteStorageFile = (id: string) => deleteRequest(`/admin/storage/files/${id}`);

export const deleteStorageFolder = (params: IDeleteStorageFolder) =>
  deleteRequest(`/admin/storage/folders/${params.id}`, {
    data: { ...params },
  });

export const deleteStorageContainer = (params: IDeleteStorageContainer) =>
  deleteRequest(`/admin/storage/containers/${params.id}`, {
    data: { ...params },
  });
