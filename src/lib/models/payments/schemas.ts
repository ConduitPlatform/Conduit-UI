import { z } from 'zod';
import { RecurringEnum, ValidityEnum } from './index';

export const ProductFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  value: z.number().min(0, 'Price must be 0 or greater'),
  vat: z.number().min(0, 'VAT must be 0 or greater'),
  currency: z.string().min(1, 'Currency is required'),
  isSubscription: z.boolean(),
  recurring: z.nativeEnum(RecurringEnum),
  recurringCount: z.number().min(1, 'Recurring count must be at least 1'),
  stripe: z.object({
    priceId: z.string().optional(),
    subscriptionId: z.string().optional(),
  }),
  creditType: z.string().optional(),
  creditAmount: z
    .number()
    .min(0, 'Credit amount must be 0 or greater')
    .optional(),
  validityAmount: z
    .number()
    .min(0, 'Validity amount must be 0 or greater')
    .optional(),
  validityUnit: z.string().optional(),
  rollover: z.boolean().optional(),
  productDescription: z.string().optional(),
  trialDays: z.number().min(0).optional(),
  supportsMultipleSeats: z.boolean().optional(),
  recurringDate: z.number().min(0).max(28).optional(),
  maxOverdueDays: z.number().min(0).optional(),
});

export const EditProductFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  value: z.number().min(0, 'Price must be 0 or greater'),
  vat: z.number().min(0, 'VAT must be 0 or greater'),
  currency: z.string().min(1, 'Currency is required'),
  isSubscription: z.boolean(),
  recurring: z.nativeEnum(RecurringEnum),
  recurringCount: z.number().min(1, 'Recurring count must be at least 1'),
  stripe: z.object({
    priceId: z.string().optional(),
    subscriptionId: z.string().optional(),
  }),
  creditType: z.string().optional(),
  creditAmount: z
    .number()
    .min(0, 'Credit amount must be 0 or greater')
    .optional(),
  validityAmount: z
    .number()
    .min(0, 'Validity amount must be 0 or greater')
    .optional(),
  validityUnit: z.string().optional(),
  rollover: z.boolean().optional(),
  productDescription: z.string().optional(),
  trialDays: z.number().min(0).optional(),
  supportsMultipleSeats: z.boolean().optional(),
  recurringDate: z.number().min(0).max(28).optional(),
  maxOverdueDays: z.number().min(0).optional(),
});

export const CustomerFormSchema = z.object({
  user: z.string().min(1, 'User is required'),
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  postCode: z.string().min(1, 'Post code is required'),
  stripe: z.object({
    customerId: z.string().optional(),
  }),
});

export const EditCustomerFormSchema = z.object({
  user: z.string().min(1, 'User is required'),
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  postCode: z.string().min(1, 'Post code is required'),
  stripe: z.object({
    customerId: z.string().optional(),
  }),
});

export const GrantBalanceFormSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  creditType: z.string().min(1, 'Credit type is required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  expiry: z.string().optional(),
});

export const PaymentsSettingsFormSchema = z.object({
  active: z.boolean(),
  secretKey: z.string().optional(),
  defaultCurrency: z.string().optional(),
  sendEmail: z.boolean().optional(),
  redeemCodes: z.boolean().optional(),
  stripe: z.object({
    enabled: z.boolean(),
    secret_key: z.string(),
  }),
  viva: z
    .object({
      enabled: z.boolean(),
      environment: z.string().optional(),
      webhookKey: z.string().optional(),
      mid: z.string().optional(),
      apiKey: z.string().optional(),
      smartCheckout: z
        .object({
          clientId: z.string().optional(),
          clientSecret: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  piraeus: z
    .object({
      enabled: z.boolean(),
      posId: z.string().optional(),
      acquirerId: z.string().optional(),
      merchantId: z.string().optional(),
      password: z.string().optional(),
      username: z.string().optional(),
      ticketing_url: z.string().optional(),
    })
    .optional(),
  revenueCat: z
    .object({
      enabled: z.boolean(),
      webhookSecret: z.string().optional(),
    })
    .optional(),
});

export type ProductFormData = z.infer<typeof ProductFormSchema>;
export type EditProductFormData = z.infer<typeof EditProductFormSchema>;
export type CustomerFormData = z.infer<typeof CustomerFormSchema>;
export type EditCustomerFormData = z.infer<typeof EditCustomerFormSchema>;
export type GrantBalanceFormData = z.infer<typeof GrantBalanceFormSchema>;
export type PaymentsSettingsFormData = z.infer<
  typeof PaymentsSettingsFormSchema
>;
