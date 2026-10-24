'use server';
import { getApiClient } from '@/lib/api';
import {
  Customer,
  CustomerBalance,
  PaymentsConfig,
  Product,
  RedeemCode,
  Subscription,
  Transaction,
} from '@/lib/models/payments';

export interface PaymentsRequest {
  skip: number;
  limit: number;
  search?: string;
  productId?: string;
  customerId?: string;
  status?: string;
  provider?: string;
  populate?: string[];
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

export const retireProduct = async (productId: string) => {
  return (await getApiClient())
    .post<Product>(`/payments/products/${productId}/retire`)
    .then(res => res.data);
};

export const unretireProduct = async (productId: string) => {
  return (await getApiClient())
    .post<Product>(`/payments/products/${productId}/unretire`)
    .then(res => res.data);
};

export const deleteProduct = async (productId: string) => {
  return (await getApiClient())
    .delete(`/payments/products/${productId}`)
    .then(res => res.data);
};

// Transactions
export const getTransactions = async (params: PaymentsRequest) => {
  type Response = {
    transactionDocuments: Transaction[];
    count: number;
  };
  const requestParams = {
    ...params,
    populate: params.populate ?? ['customer', 'products.product'],
  };
  return (await getApiClient())
    .get<Response>(`/payments/transactions`, { params: requestParams })
    .then(res => res.data);
};

export const getTransaction = async (id: string, populate?: string[]) => {
  return (await getApiClient())
    .get<Transaction>(`/payments/transactions/${id}`, {
      params: populate?.length ? { populate } : undefined,
    })
    .then(res => res.data);
};

export type UpdateTransactionBody = {
  status?: string;
  price?: number;
  priceWithVat?: number;
};

export const updateTransaction = async (
  id: string,
  data: UpdateTransactionBody
) => {
  return (await getApiClient())
    .patch<{
      updatedTransaction: Transaction;
    }>(`/payments/transactions/${id}`, data)
    .then(res => res.data.updatedTransaction);
};

export const cancelTransaction = async (id: string) => {
  return (await getApiClient())
    .patch<{
      updatedTransaction: Transaction;
    }>(`/payments/transactions/${id}/cancel`)
    .then(res => res.data.updatedTransaction);
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
    subscriptionDocuments: Subscription[];
    count: number;
  };
  const requestParams = {
    ...params,
    populate: params.populate ?? ['product', 'customer'],
  };
  return (await getApiClient())
    .get<Response>(`/payments/subscriptions`, { params: requestParams })
    .then(res => res.data);
};

export const getSubscription = async (id: string, populate?: string[]) => {
  return (await getApiClient())
    .get<Subscription>(`/payments/subscriptions/${id}`, {
      params: populate?.length ? { populate } : undefined,
    })
    .then(res => res.data);
};

export type UpdateSubscriptionBody = {
  status?: string;
  activeUntil?: string;
  nextPayment?: string;
  isTrial?: boolean;
};

export const updateSubscription = async (
  id: string,
  data: UpdateSubscriptionBody
) => {
  return (await getApiClient())
    .patch<{
      updatedSubscription: Subscription;
    }>(`/payments/subscriptions/${id}`, data)
    .then(res => res.data.updatedSubscription);
};

export const cancelSubscription = async (id: string) => {
  return (await getApiClient())
    .patch<{
      updatedSubscription: Subscription;
    }>(`/payments/subscriptions/${id}/cancel`)
    .then(res => res.data.updatedSubscription);
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
  data: { amount?: number }
) => {
  return (await getApiClient())
    .patch<{
      updatedBalance: CustomerBalance | null;
    }>(`/payments/balances/${balanceId}`, data)
    .then(res => res.data.updatedBalance);
};

// Redeem codes (requires payments.redeemCodes in module config)
export interface RedeemCodesListParams {
  skip: number;
  limit: number;
  search?: string;
  productId?: string;
  isUsed?: boolean;
  populate?: string[];
}

export const getRedeemCodes = async (params: RedeemCodesListParams) => {
  type Response = {
    redeemCodeDocuments: RedeemCode[];
    count: number;
  };
  const requestParams = {
    ...params,
    populate: params.populate ?? ['product'],
  };
  return (await getApiClient())
    .get<Response>(`/payments/redeem-codes`, { params: requestParams })
    .then(res => res.data);
};

export const createRedeemCodes = async (data: {
  productId: string;
  codes: string[];
  validUntil?: string;
}) => {
  return (await getApiClient())
    .post<unknown>(`/payments/redeem-code`, data)
    .then(res => res.data);
};

export const deleteRedeemCode = async (id: string) => {
  return (await getApiClient())
    .delete(`/payments/redeem-codes/${id}`)
    .then(res => res.data);
};
