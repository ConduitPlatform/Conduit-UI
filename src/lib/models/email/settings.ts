export type EmailSettings = {
  active: boolean;
  sendingDomain: string;
  transport: TransportProviders;
  transportSettings: TransportSettings;
  storeEmails: StorageSettings;
};

export interface StorageSettings {
  enabled: boolean;
  storage: {
    enabled: boolean;
    container: string;
    folder: string;
  };
  cleanupSettings: {
    enabled: boolean;
    repeat: number;
    limit: number;
  };
}

export type TransportProviders =
  | 'mailgun'
  | 'smtp'
  | 'mandrill'
  | 'sendgrid'
  | 'mailersend'
  | 'amazonSes';

export interface TransportSettings {
  mailgun: MailgunSettings;
  smtp: SmtpSettings;
  mandrill: MandrillSettings;
  sendgrid: SendgridSettings;
  mailersend: MailersendSettings;
  amazonSes: AmazonSesSettings;
}

export interface MailgunSettings {
  apiKey: string;
  host: string;
  proxy?: string;
}

export interface SmtpSettings {
  port: number;
  host: string;
  secure: boolean;
  ignoreTls: boolean;
  auth: {
    username: string;
    password: string;
    method: string;
  };
}

export interface MandrillSettings {
  apiKey: string;
}

export interface SendgridSettings {
  apiKey: string;
  residency: string;
}

export interface MailersendSettings {
  host: string;
  port: number;
  apiKey: string;
}

export interface AmazonSesSettings {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}
