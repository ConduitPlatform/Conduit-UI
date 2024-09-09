import { EmailSettings } from '@/lib/models/email/settings';

export type EmailConfigResponse = {
  config: EmailSettings;
};
export * from '@/lib/models/email/settings';
export * from '@/lib/models/email/schemas';
