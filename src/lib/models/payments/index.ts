export interface Customer {
  _id?: string;
  user: string | any; // Can be User object or string
  email: string;
  phoneNumber: string;
  firstName: string;
  lastname: string;
  address: string;
  postCode: string;
  phone?: string; // Alternative to phoneNumber
  stripe: {
    customerId: string;
  };
  updatedAt?: string;
  createdAt?: string;
}

export interface Product {
  _id?: string;
  name: string;
  externalIds?: string[];
  productDescription?: string;
  value: number;
  vat: number;
  currency: string;
  isSubscription: boolean;
  trialDays?: number;
  supportsMultipleSeats?: boolean;
  recurring: RecurringEnum;
  recurringCount: number;
  recurringDate?: number;
  maxOverdueDays?: number;
  stripe?: {
    subscriptionId?: string;
    priceId: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export enum RecurringEnum {
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
}

export interface Transaction {
  _id?: string;
  customer: string | any; // Can be Customer object or string
  provider: string;
  product: string | any; // Can be Product object or string
  products?: Array<{
    product: string;
    quantity: number;
  }>;
  cardId?: string | any; // Can be CardToken object or string
  price: number;
  priceWithVat: number;
  vatPercentage: number;
  quantity: number;
  proratedPeriod?: number;
  data: any;
  providerResponse?: any[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subscription {
  _id?: string;
  product: string;
  userId: string;
  customerId: string;
  iamport: {
    nextPaymentId: string;
  };
  activeUntil: string;
  transactions: Transaction[];
  provider: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentsConfig {
  active: boolean;
  secretKey?: string;
  defaultCurrency?: string;
  sendEmail?: boolean;
  redeemCodes?: boolean;
  stripe: {
    enabled: boolean;
    secret_key: string;
  };
  viva?: {
    enabled: boolean;
    environment?: string;
    webhookKey?: string;
    mid?: string;
    apiKey?: string;
    smartCheckout?: {
      clientId?: string;
      clientSecret?: string;
    };
  };
  piraeus?: {
    enabled: boolean;
    posId?: string;
    acquirerId?: string;
    merchantId?: string;
    password?: string;
    username?: string;
    ticketing_url?: string;
  };
  revenueCat?: {
    enabled: boolean;
    webhookSecret?: string;
  };
}
