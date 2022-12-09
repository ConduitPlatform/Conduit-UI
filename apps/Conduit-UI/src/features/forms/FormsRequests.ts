import { IFormsConfig, FormsModel } from './FormsModels';
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
  putRequest,
} from '../../http/requestsConfig';
import { Pagination, Search, Sort } from '../../models/http/HttpModels';

export const getForms = (params: Pagination & Search & Sort) => getRequest(`/forms/forms`, params);

export const createForm = (data: any) => postRequest(`/forms/forms`, data);

export const deleteFormsRequest = (ids: string[]) => {
  return deleteRequest(`/forms/forms`, { ids });
};

export const getFormReplies = (id: string) => getRequest(`/forms/replies/${id}`);

export const updateForm = (id: string, data: FormsModel) => putRequest(`/forms/${id}`, data);

export const getFormsConfig = () => getRequest(`/config/forms`);

export const patchFormsConfig = (body: IFormsConfig) =>
  patchRequest(`/config/forms`, {
    config: { ...body },
  });
