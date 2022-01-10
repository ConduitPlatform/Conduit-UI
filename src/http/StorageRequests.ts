import axios from 'axios';
import { CONDUIT_API } from './requestsConfig';
import { IStorageConfig } from '../models/storage/StorageModels';
import {
  ICreateStorageContainer,
  ICreateStorageFile,
  ICreateStorageFolder,
  IDeleteStorageContainer,
  IDeleteStorageFolder,
  IGetStorageContainers,
  IGetStorageFiles,
  IGetStorageFolders,
} from '../models/storage/StorageRequestsModels';

export const getStorageSettings = () => axios.get(`${CONDUIT_API}/admin/config/storage`);

export const putStorageSettings = (storageData: IStorageConfig) =>
  axios.put(`${CONDUIT_API}/admin/config/storage`, {
    config: {
      ...storageData,
    },
  });

export const getStorageContainers = (params: IGetStorageContainers) =>
  axios.get(`${CONDUIT_API}/admin/storage/containers`, {
    params: {
      ...params,
    },
  });

export const getStorageFolders = (folderData: IGetStorageFolders) =>
  axios.get(`${CONDUIT_API}/admin/storage/folders`, {
    params: {
      ...folderData,
    },
  });

export const getStorageFiles = (fileData: IGetStorageFiles) =>
  axios.get(`${CONDUIT_API}/admin/storage/files`, {
    params: {
      ...fileData,
    },
  });

export const getStorageFile = (id: string) =>
  axios.get(`${CONDUIT_API}/admin/storage/files/${id}/data`);

export const getStorageFileUrl = (id: string, redirect: boolean) =>
  axios.get(`${CONDUIT_API}/admin/storage/files/${id}/url`, {
    params: {
      redirect: false,
    },
  });

// export const updateStorageFile = (fileData: IStorageFile) =>
export const updateStorageFile = (
  fileData: any //not working
) => axios.patch(`${CONDUIT_API}/admin/storage/files/${fileData.id}`, { ...fileData });

export const createStorageFile = (fileData: ICreateStorageFile) =>
  axios.post(`${CONDUIT_API}/admin/storage/files`, { ...fileData });

export const createStorageFolder = (folderData: ICreateStorageFolder) =>
  axios.post(`${CONDUIT_API}/admin/storage/folders`, { ...folderData });

export const createStorageContainer = (containerData: ICreateStorageContainer) =>
  axios.post(`${CONDUIT_API}/admin/storage/containers`, { ...containerData });

export const deleteStorageFile = (id: string) =>
  axios.delete(`${CONDUIT_API}/admin/storage/files/${id}`);

export const deleteStorageFolder = (params: IDeleteStorageFolder) =>
  axios.delete(`${CONDUIT_API}/admin/storage/folders/${params.id}`, {
    data: { ...params },
  });

export const deleteStorageContainer = (params: IDeleteStorageContainer) =>
  axios.delete(`${CONDUIT_API}/admin/storage/containers/${params.id}`, {
    data: { ...params },
  });
