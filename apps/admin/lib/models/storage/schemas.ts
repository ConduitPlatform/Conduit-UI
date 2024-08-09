export type Container = {
  _id: string;
  name: string;
  isPublic?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type ConduitFile = {
  _id: string;
  name: string;
  alias: string;
  folder: string;
  container: string;
  size: number;
  isPublic?: boolean;
  url: string;
  mimeType: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type Folder = {
  _id: string;
  name: string;
  container: string;
  isPublic?: boolean;
  url: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};
