export type Container = {
  _id: string;
  name: string;
  isPublic?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type FileUploadStatus = 'pending' | 'ready';

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
  uploadStatus?: FileUploadStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export function isFileUploadReady(file: { uploadStatus?: string }): boolean {
  return file.uploadStatus !== 'pending';
}

export function fileUploadStatusLabel(status?: string): string {
  return status === 'pending' ? 'Pending' : 'Ready';
}

export type Folder = {
  _id: string;
  name: string;
  container: string;
  isPublic?: boolean;
  url: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};
