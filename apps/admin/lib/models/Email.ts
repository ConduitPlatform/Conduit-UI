export type EmailSettings = {
  active: boolean;
  sendingDomain: string;
  transport: TransportProviders;
  transportSettings: TransportSettings;
}

export type TransportProviders = 'mailgun' | 'smtp' | 'mandrill' | 'sendgrid';

export interface TransportSettings {
  mailgun: MailgunSettings;
  smtp: SmtpSettings;
  mandrill: MandrillSettings;
  sendgrid: SendgridSettings;
}

export interface MailgunSettings {
  apiKey: string;
  host: string;
  proxy: string;
}

export interface SmtpSettings {
  port: string;
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
}
