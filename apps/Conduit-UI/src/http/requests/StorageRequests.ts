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

export const getStorageSettings = () => getRequest(`/config/storage`);

export const putStorageSettings = (storageData: IStorageConfig) =>
  putRequest(`/config/storage`, {
    config: {
      ...storageData,
    },
  });

export const getStorageContainers = (params: IGetStorageContainers) =>
  getRequest(`/storage/containers`, {
    params: {
      ...params,
    },
  });

export const getStorageFolders = (folderData: IGetStorageFolders) =>
  getRequest(`/storage/folders`, {
    params: {
      ...folderData,
    },
  });

export const getStorageFiles = (fileData: IGetStorageFiles) =>
  getRequest(`/storage/files`, {
    params: {
      ...fileData,
    },
  });

export const getStorageFile = (id: string) => getRequest(`/storage/files/${id}/data`);

export const getStorageFileUrl = (id: string, redirect: boolean) =>
  getRequest(`/storage/files/${id}/url`, {
    params: {
      redirect: false,
    },
  });

// export const updateStorageFile = (fileData: IStorageFile) =>
export const updateStorageFile = (
  fileData: any //not working
) => patchRequest(`/storage/files/${fileData.id}`, { ...fileData });

export const createStorageFile = (fileData: ICreateStorageFile) =>
  postRequest(`/storage/files`, { ...fileData });

export const createStorageFolder = (folderData: ICreateStorageFolder) =>
  postRequest(`/storage/folders`, { ...folderData });

export const createStorageContainer = (containerData: ICreateStorageContainer) =>
  postRequest(`/storage/containers`, { ...containerData });

export const deleteStorageFile = (id: string) => deleteRequest(`/storage/files/${id}`);

export const deleteStorageFolder = (params: IDeleteStorageFolder) =>
  deleteRequest(`/storage/folders/${params.id}`, {
    data: { ...params },
  });

export const deleteStorageContainer = (params: IDeleteStorageContainer) =>
  deleteRequest(`/storage/containers/${params.id}`, {
    data: { ...params },
  });
