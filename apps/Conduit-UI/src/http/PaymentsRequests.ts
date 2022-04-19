import axios from 'axios';
import { Customer, PaymentsConfig, Product } from '../models/payments/PaymentsModels';
import { CONDUIT_API } from './requestsConfig';

export interface IRequest {
  skip: number;
  limit: number;
  search?: string;
  productId?: string;
  customerId?: string;
}

export const getCustomersRequest = (params: IRequest) =>
  axios.get(`${CONDUIT_API}/admin/payments/customers`, {
    params: { ...params },
  });

export const postCustomerRequest = (data: Customer) =>
  axios.post(`${CONDUIT_API}/admin/payments/customers`, { ...data });

export const putCustomerRequest = (customerId: string, data: Customer) =>
  axios.put(`${CONDUIT_API}/admin/payments/customer/${customerId}`, { ...data });

export const deleteCustomerRequest = (ids: string[]) =>
  axios.delete(`${CONDUIT_API}/admin/payments/customer`, { data: { ids: ids } });

export const getProductsRequest = (params: IRequest) =>
  axios.get(`${CONDUIT_API}/admin/payments/products`, {
    params: { ...params },
  });

export const postProductsRequest = (data: Product) =>
  axios.post(`${CONDUIT_API}/admin/payments/products`, { ...data });

export const patchProductRequest = (productId: string, data: Product) =>
  axios.patch(`${CONDUIT_API}/admin/payments/products/${productId}`, { ...data });

export const deleteProductRequest = (ids: string[]) =>
  axios.delete(`${CONDUIT_API}/admin/payments/products`, { data: { ids: ids } });

export const getTransactionsRequest = (params: IRequest) =>
  axios.get(`${CONDUIT_API}/admin/payments/transactions`, {
    params: { ...params },
  });

export const deleteTransactionRequest = (ids: string[]) =>
  axios.delete(`${CONDUIT_API}/admin/payments/transactions`, { data: { ids: ids } });

export const getSubscriptionsRequest = (params: IRequest) =>
  axios.get(`${CONDUIT_API}/admin/payments/subscription`, {
    params: { ...params },
  });

export const getPaymentSettingsRequest = () => axios.get(`${CONDUIT_API}/admin/config/payments`);

export const putPaymentSettingsRequest = (data: PaymentsConfig) =>
  axios.put(`${CONDUIT_API}/admin/config/payments`, { config: { ...data } });
