import { Customer, PaymentsConfig, Product } from '../../models/payments/PaymentsModels';
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
  putRequest,
} from '../requestsConfig';

export interface IRequest {
  skip: number;
  limit: number;
  search?: string;
  productId?: string;
  customerId?: string;
}

export const getCustomersRequest = (params: IRequest) =>
  getRequest(`/admin/payments/customers`, {
    params: { ...params },
  });

export const postCustomerRequest = (data: Customer) =>
  postRequest(`/admin/payments/customers`, { ...data });

export const putCustomerRequest = (customerId: string, data: Customer) =>
  putRequest(`/admin/payments/customer/${customerId}`, { ...data });

export const deleteCustomerRequest = (ids: string[]) =>
  deleteRequest(`/admin/payments/customer`, { data: { ids: ids } });

export const getProductsRequest = (params: IRequest) =>
  getRequest(`/admin/payments/products`, {
    params: { ...params },
  });

export const postProductsRequest = (data: Product) =>
  postRequest(`/admin/payments/products`, { ...data });

export const patchProductRequest = (productId: string, data: Product) =>
  patchRequest(`/admin/payments/products/${productId}`, { ...data });

export const deleteProductRequest = (ids: string[]) =>
  deleteRequest(`/admin/payments/products`, { data: { ids: ids } });

export const getTransactionsRequest = (params: IRequest) =>
  getRequest(`/admin/payments/transactions`, {
    params: { ...params },
  });

export const deleteTransactionRequest = (ids: string[]) =>
  deleteRequest(`/admin/payments/transactions`, { data: { ids: ids } });

export const getSubscriptionsRequest = (params: IRequest) =>
  getRequest(`/admin/payments/subscription`, {
    params: { ...params },
  });

export const getPaymentSettingsRequest = () => getRequest(`/admin/config/payments`);

export const putPaymentSettingsRequest = (data: PaymentsConfig) =>
  putRequest(`/admin/config/payments`, { config: { ...data } });
