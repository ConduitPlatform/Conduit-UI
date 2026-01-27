import { EmailSettings } from '@/lib/models/email';
import { SmsSettings } from '@/lib/models/Sms';
import { NotificationSettings } from '@/lib/models/Notification';

export interface CommunicationsConfig {
  email: EmailSettings;
  sms: SmsSettings;
  pushNotifications: NotificationSettings;
}

export interface CommunicationsConfigResponse {
  config: CommunicationsConfig;
}

export type CommunicationsModuleName = 'email' | 'sms' | 'pushNotifications';
