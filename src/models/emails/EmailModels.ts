export interface EmailTemplateType {
  body: string;
  name: string;
  subject: string;
  variables: string[];
  sender?: string;
  externalManaged: boolean;
  _id?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface MailgunSettings {
  apiKey: string;
  domain: string;
  host: string;
  proxy: string;
}

export interface SmtpSettings {
  port: string;
  host: string;
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

export type TransportProviders = 'mailgun' | 'smtp' | 'mandrill' | 'sendgrid';

export interface ITransportSettings {
  mailgun: MailgunSettings;
  smtp: SmtpSettings;
  mandrill: MandrillSettings;
  sendgrid: SendgridSettings;
}

export interface IEmailConfig {
  active: boolean;
  sendingDomain: string;
  transport: TransportProviders;
  transportSettings: ITransportSettings;
}

export interface EmailData {
  body: string;
  name: string;
  subject: string;
  variables: string[];
}

export interface SendEmailData {
  templateName?: string;
  variables?: { [key: string]: string };
  subject?: string;
  sender: string;
  email: string;
  body: string;
}

export interface EmailUI {
  _id: string;
  Name: string;
  External: string;
  Synced: string;
  'Updated At': string;
}
