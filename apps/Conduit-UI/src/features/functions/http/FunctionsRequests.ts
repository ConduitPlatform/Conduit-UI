import { deleteRequest, getRequest, patchRequest, postRequest } from '../../../http/requestsConfig';
import { FunctionData, IFunctionsConfig } from '../models/FunctionsModels';
import { Pagination, Search, Sort } from '../../../models/http/HttpModels';

// export const getExternalTemplatesRequest = () => getRequest(`/email/externalTemplates`);
//
export const getFunctionsRequest = (params: Pagination & Search & Sort) =>
  getRequest(`/functions`, params);

export const postFunctionRequest = (data: FunctionData) =>
  postRequest(`/functions/upload`, { ...data });

export const patchFunctionRequest = (functionId: string, data: Partial<FunctionData>) =>
  patchRequest(`/functions/${functionId}`, { ...data });

export const deleteFunctionsRequest = (ids: string[]) => {
  return deleteRequest(`/functions/`, { ids: ids.join(',') });
};

export const getFunctionsSettingsRequest = () => getRequest(`/config/functions`);

export const patchFunctionsSettingsRequest = (data: IFunctionsConfig) =>
  patchRequest(`/config/functions`, { config: { ...data } });
