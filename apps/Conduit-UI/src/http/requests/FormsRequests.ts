import { IFormsConfig, FormsModel } from '../../models/forms/FormsModels';
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
  putRequest,
} from '../requestsConfig';
import { Pagination, Search, Sort } from '../../models/http/HttpModels';

export const getForms = (params: Pagination & Search & Sort) =>
  getRequest(`/forms/forms`, {
    params,
  });

export const createForm = (data: any) => postRequest(`/forms/forms`, data);

export const deleteFormsRequest = (ids: string[]) => {
  return deleteRequest(`/forms/forms`, { params: { ids } });
};

export const getFormReplies = (id: string) => getRequest(`/forms/replies/${id}`);

export const updateForm = (id: string, data: FormsModel) => putRequest(`/forms/forms/${id}`, data);

export const getFormsConfig = () => getRequest(`/config/forms`);

export const patchFormsConfig = (body: IFormsConfig) =>
  patchRequest(`/config/forms`, {
    config: { ...body },
  });
