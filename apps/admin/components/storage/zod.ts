import { z } from 'zod';
import { StorageProvider } from '@/lib/models/Storage';

export const BaseSchema = z.object({
  provider: z.union([
    z.literal('google'),
    z.literal('azure'),
    z.literal('aws'),
    z.literal('aliyun'),
    z.literal('local'),
  ]).refine(p => p as StorageProvider),
  authorization: z.object({
    enabled: z.boolean(),
  }),
  defaultContainer: z.string().min(1),
  allowContainerCreation: z.boolean(),
});

const GoogleSchema = z.object({
  serviceAccountKeyPath: z.string().min(5)
});

const AzureSchema = z.object({
  connectionString: z.string().min(5)
});

const AwsSchema = z.object({
  region: z.string().min(2),
  accessKeyId: z.string().min(5),
  secretAccessKey: z.string().min(5),
  accountId: z.string().min(5),
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

export const FormSchema = z.discriminatedUnion(
  'provider',
  [
    BaseSchema.merge(z.object({
      provider: z.literal('google'),
      google: GoogleSchema,
    })),
    BaseSchema.merge(z.object({
      provider: z.literal('azure'),
      azure: AzureSchema,
    })),
    BaseSchema.merge(z.object({
      provider: z.literal('aws'),
      aws: AwsSchema,
    })),
    BaseSchema.merge(z.object({
      provider: z.literal('aliyun'),
      aliyun: AliyunSchema,
    })),
    BaseSchema.merge(z.object({
      provider: z.literal('local'),
      local: LocalSchema,
    })),
  ],
);
