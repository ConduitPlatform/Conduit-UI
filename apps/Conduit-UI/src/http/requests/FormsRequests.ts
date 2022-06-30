import { IFormsConfig, FormsModel } from '../../models/forms/FormsModels';
import { deleteRequest, getRequest, postRequest, putRequest } from '../requestsConfig';
import { Pagination, Search, Sort } from '../../models/http/HttpModels';

export const getForms = (params: Pagination & Search & Sort) =>
  getRequest(`/admin/forms/forms`, {
    params,
  });

export const createForm = (data: any) => postRequest(`/admin/forms/forms`, data);

export const deleteFormsRequest = (ids: string[]) => {
  return deleteRequest(`/admin/forms/forms`, { params: { ids } });
};

export const getFormReplies = (id: string) => getRequest(`/admin/forms/replies/${id}`);

export const updateForm = (id: string, data: FormsModel) =>
  putRequest(`/admin/forms/forms/${id}`, data);

export const getFormsConfig = () => getRequest(`/admin/config/forms`);

export const updateFormsConfig = (body: IFormsConfig) =>
  putRequest(`/admin/config/forms`, {
    config: { ...body },
  });
