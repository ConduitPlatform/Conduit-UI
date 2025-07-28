'use server';
import { getApiClient } from '@/lib/api';
import {
  Customer,
  CustomerBalance,
  PaymentsConfig,
  Product,
} from '@/lib/models/payments';

export interface PaymentsRequest {
  skip: number;
  limit: number;
  search?: string;
  productId?: string;
  customerId?: string;
}

// Customers
export const getCustomers = async (params: PaymentsRequest) => {
  type Response = {
    customerDocuments: Customer[];
    count: number;
  };
  return (await getApiClient())
    .get<Response>(`/payments/customers`, { params })
    .then(res => res.data);
};

export const createCustomer = async (data: Customer) => {
  return (await getApiClient())
    .post<Customer>(`/payments/customers`, data)
    .then(res => res.data);
};

// Note: PUT endpoint for customers doesn't exist in the API
// We'll need to use PATCH or handle this differently
export const updateCustomer = async (customerId: string, data: Customer) => {
  return (await getApiClient())
    .patch<Customer>(`/payments/customers/${customerId}`, data)
    .then(res => res.data);
};

// Note: DELETE endpoint for customers doesn't exist in the API
// export const deleteCustomers = async (ids: string[]) => {
//   return (await getApiClient())
//     .delete(`/payments/customers`, { data: { ids } })
//     .then(res => res.data);
// };

// Products
export const getProducts = async (params: PaymentsRequest) => {
  type Response = {
    productDocuments: Product[];
    count: number;
  };
  return (await getApiClient())
    .get<Response>(`/payments/products`, { params })
    .then(res => res.data);
};

export const createProduct = async (data: Product) => {
  return (await getApiClient())
    .post<Product>(`/payments/products`, data)
    .then(res => res.data);
};

export const updateProduct = async (productId: string, data: Product) => {
  return (await getApiClient())
    .patch<Product>(`/payments/products/${productId}`, data)
    .then(res => res.data);
};

// Note: DELETE endpoint for products doesn't exist in the API
// export const deleteProducts = async (ids: string[]) => {
//   return (await getApiClient())
//     .delete(`/payments/products`, { data: { ids } })
//     .then(res => res.data);
// };

// Transactions
export const getTransactions = async (params: PaymentsRequest) => {
  type Response = {
    transactionDocuments: any[];
    count: number;
  };
  return (await getApiClient())
    .get<Response>(`/payments/transactions`, { params })
    .then(res => res.data);
};

// Note: DELETE endpoint for transactions doesn't exist in the API
// export const deleteTransactions = async (ids: string[]) => {
//   return (await getApiClient())
//     .delete(`/payments/transactions`, { data: { ids } })
//     .then(res => res.data);
// };

// Subscriptions
export const getSubscriptions = async (params: PaymentsRequest) => {
  type Response = {
    subscriptionDocuments: any[];
    count: number;
  };
  return (await getApiClient())
    .get<Response>(`/payments/subscriptions`, { params })
    .then(res => res.data);
};

// Configuration
export const getPaymentSettings = async () => {
  type Response = {
    config: PaymentsConfig;
  };
  return (await getApiClient())
    .get<Response>(`/config/payments`)
    .then(res => res.data);
};

export const updatePaymentSettings = async (data: PaymentsConfig) => {
  return (await getApiClient())
    .patch(`/config/payments`, { config: data })
    .then(res => res.data);
};

// Customer Balances
export const getCustomerBalances = async (
  userId: string,
  creditType?: string
) => {
  type Response = {
    balances: CustomerBalance[];
    count: number;
  };
  const params: any = { userId };
  if (creditType) {
    params.creditType = creditType;
  }
  return (await getApiClient())
    .get<Response>(`/payments/balances`, { params })
    .then(res => res.data);
};

export const grantBalance = async (data: {
  userId: string;
  creditType: string;
  amount: number;
  expiry?: string;
}) => {
  return (await getApiClient())
    .post<CustomerBalance>(`/payments/balances`, data)
    .then(res => res.data);
};

export const updateBalance = async (
  balanceId: string,
  data: Partial<CustomerBalance>
) => {
  return (await getApiClient())
    .patch<CustomerBalance>(`/payments/balances/${balanceId}`, data)
    .then(res => res.data);
};
