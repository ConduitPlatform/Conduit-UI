import { Customer, PaymentsConfig, Product } from './PaymentsModels';
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
  putRequest,
} from '../../http/requestsConfig';

export interface IRequest {
  skip: number;
  limit: number;
  search?: string;
  productId?: string;
  customerId?: string;
}

export const getCustomersRequest = (params: IRequest) =>
  getRequest(`/payments/customers`, {
    params: { ...params },
  });

export const postCustomerRequest = (data: Customer) =>
  postRequest(`/payments/customers`, { ...data });

export const putCustomerRequest = (customerId: string, data: Customer) =>
  putRequest(`/payments/customer/${customerId}`, { ...data });

export const deleteCustomerRequest = (ids: string[]) =>
  deleteRequest(`/payments/customer`, { data: { ids: ids } });

export const getProductsRequest = (params: IRequest) =>
  getRequest(`/payments/products`, {
    params: { ...params },
  });

export const postProductsRequest = (data: Product) =>
  postRequest(`/payments/products`, { ...data });

export const patchProductRequest = (productId: string, data: Product) =>
  patchRequest(`/payments/products/${productId}`, { ...data });

export const deleteProductRequest = (ids: string[]) =>
  deleteRequest(`/payments/products`, { data: { ids: ids } });

export const getTransactionsRequest = (params: IRequest) =>
  getRequest(`/payments/transactions`, {
    params: { ...params },
  });

export const deleteTransactionRequest = (ids: string[]) =>
  deleteRequest(`/payments/transactions`, { data: { ids: ids } });

export const getSubscriptionsRequest = (params: IRequest) =>
  getRequest(`/payments/subscription`, {
    params: { ...params },
  });

export const getPaymentSettingsRequest = () => getRequest(`/config/payments`);

export const patchPaymentSettingsRequest = (data: PaymentsConfig) =>
  patchRequest(`/config/payments`, { config: { ...data } });
