export interface IStorageConfig {
  active: boolean;
  provider: ProviderType;
  storagePath: string;
  allowContainerCreation: boolean;
  defaultContainer: string;
  azure: {
    connectionString: string;
  };
  google: {
    serviceAccountKeyPath: string;
    bucketName: string;
  };
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    accountId: string;
    endpoint: string;
  };
  aliyun: {
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
  };
  local: {
    storagePath: string;
  };
}

export type ProviderType = keyof Omit<
  IStorageConfig,
  'active' | 'provider' | 'storagePath' | 'allowContainerCreation' | 'defaultContainer'
>;

export interface IStorageFileData {
  container: string;
  createdAt: string;
  updatedAt: string;
  folder?: string;
  isFile: boolean;
  isPublic: boolean;
  mimeType: string;
  name: string;
  url?: string;
  _id: string;
  __v: number;
}

export interface IStorageFolderData {
  container: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  name: string;
  _id: string;
  __v: number;
}

export type ContainerDataProps = IStorageFileData | IStorageFolderData;

export interface IStorageContainerData {
  createdAt: string;
  isPublic: boolean;
  name: string;
  updatedAt: string;
  __v: number;
  _id: string;
}

export interface IStorageFile {
  name: string;
  data: string;
  folder?: string;
  container: string;
  mimeType: string;
  isPublic: boolean;
}

export interface IContainer {
  createdAt: string;
  isPublic: boolean;
  name: string;
  updatedAt: string;
  __v: number;
  _id: string;
}

export enum CreateFormSelected {
  folder = 'folder',
  container = 'container',
}

export interface ICreateForm {
  container: {
    name: string;
    isPublic: boolean;
  };
  folder: {
    name: string;
    container: string;
    isPublic: boolean;
  };
}
