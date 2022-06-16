import axios from 'axios';
import { IFormsConfig, FormsModel } from '../models/forms/FormsModels';
import { CONDUIT_API } from './requestsConfig';
import { Pagination, Search, Sort } from '../models/http/HttpModels';

export const getForms = (params: Pagination & Search & Sort) =>
  axios.get(`${CONDUIT_API}/admin/forms/forms`, {
    params,
  });

export const createForm = (data: any) => axios.post(`${CONDUIT_API}/admin/forms/forms`, data);

export const deleteFormsRequest = (ids: string[]) => {
  return axios.delete(`${CONDUIT_API}/admin/forms/forms`, { params: { ids } });
};

export const getFormReplies = (id: string) => axios.get(`${CONDUIT_API}/admin/forms/replies/${id}`);

export const updateForm = (id: string, data: FormsModel) =>
  axios.put(`${CONDUIT_API}/admin/forms/forms/${id}`, data);

export const getFormsConfig = () => axios.get(`${CONDUIT_API}/admin/config/forms`);

export const updateFormsConfig = (body: IFormsConfig) =>
  axios.put(`${CONDUIT_API}/admin/config/forms`, {
    config: { ...body },
  });
