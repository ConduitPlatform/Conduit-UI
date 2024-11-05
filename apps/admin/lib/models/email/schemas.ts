export type EmailTemplate = {
  _id: string;
  name: string;
  subject?: string;
  body: string;
  variables?: string[];
  sender?: string;
  externalManaged: boolean;
  externalId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type EmailRecord = {
  _id: string;
  messageId?: string;
  template: string | EmailTemplate;
  contentFile: string;
  sender: string;
  receiver: string;
  cc?: string[];
  replyTo?: string;
  sendingDomain?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type ExternalTemplate = {
  _id: string;
  name: string;
  subject?: string;
  body: string;
  createdAt: string;
  variables?: string[];
};

export type EmailPayload = {
  email: string;
  sender: string;
  variables?: { [key: string]: any };
  subject?: string;
  body?: string;
  templateName?: string;
};
