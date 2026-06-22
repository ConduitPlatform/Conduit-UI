export type CommunicationChannel = 'email' | 'push' | 'sms';

export interface CommunicationTemplate {
  _id: string;
  name: string;
  summary?: string;
  channels: CommunicationChannel[];
  email?: {
    subject?: string;
    body?: string;
    sender?: string;
  };
  push?: {
    title?: string;
    body?: string;
  };
  sms?: {
    message?: string;
  };
  variables?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationTemplatePayload {
  name: string;
  channels: CommunicationChannel[];
  email?: CommunicationTemplate['email'];
  push?: CommunicationTemplate['push'];
  sms?: CommunicationTemplate['sms'];
  variables?: string[];
  templateDescription?: string;
}
