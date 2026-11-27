import { z } from 'zod';
import { StorageProvider } from '@/lib/models/storage';

// Same bounds as the storage module (STORAGE_WRITE_MAX, ConduitPlatform/Conduit#1691)
const WRITE_RATE_LIMIT_MAX_REQUESTS = 1_000_000;
const WRITE_RATE_LIMIT_MAX_INTERVAL = 86_400;

const positiveInteger = (max: number, maxMessage: string) =>
  z
    .number({ error: 'Enter a number' })
    .int('Must be a whole number')
    .positive('Must be greater than 0')
    .max(max, maxMessage);

export const RateLimitsSchema = z.object({
  write: z.object({
    maxRequests: positiveInteger(
      WRITE_RATE_LIMIT_MAX_REQUESTS,
      'Must be at most 1000000'
    ),
    resetInterval: positiveInteger(
      WRITE_RATE_LIMIT_MAX_INTERVAL,
      'Must be at most 86400 seconds (24 hours)'
    ),
  }),
});

export const BaseSchema = z.object({
  provider: z
    .union([
      z.literal('google'),
      z.literal('azure'),
      z.literal('aws'),
      z.literal('aliyun'),
      z.literal('local'),
    ])
    .refine(p => p as StorageProvider),
  authorization: z.object({
    enabled: z.boolean(),
  }),
  defaultContainer: z.string().min(1),
  allowContainerCreation: z.boolean(),
  // optional: older servers do not return (or accept) rateLimits
  rateLimits: RateLimitsSchema.optional(),
});

const GoogleSchema = z.object({
  serviceAccountKeyPath: z.string().optional().or(z.literal('')).default(''),
  serviceAccountKeyJson: z.string().optional().or(z.literal('')).default(''),
});

const AzureSchema = z.object({
  connectionString: z.string().min(5),
});

const AwsSchema = z.object({
  region: z.string().min(2).max(100).or(z.literal('')),
  accessKeyId: z.string().min(5),
  secretAccessKey: z.string().min(5),
  accountId: z.string().min(5).max(100).or(z.literal('')),
  endpoint: z.string().optional(),
});

const AliyunSchema = z.object({
  region: z.string().min(2),
  accessKeyId: z.string().min(5),
  accessKeySecret: z.string().min(5),
});

const LocalSchema = z.object({
  storagePath: z.string().min(1),
});

export const FormSchema = z.discriminatedUnion('provider', [
  BaseSchema.merge(
    z.object({
      provider: z.literal('google'),
      google: GoogleSchema,
    })
  ),
  BaseSchema.merge(
    z.object({
      provider: z.literal('azure'),
      azure: AzureSchema,
    })
  ),
  BaseSchema.merge(
    z.object({
      provider: z.literal('aws'),
      aws: AwsSchema,
    })
  ),
  BaseSchema.merge(
    z.object({
      provider: z.literal('aliyun'),
      aliyun: AliyunSchema,
    })
  ),
  BaseSchema.merge(
    z.object({
      provider: z.literal('local'),
      local: LocalSchema,
    })
  ),
]);
