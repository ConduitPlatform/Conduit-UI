export interface TwilioConfig {
  phoneNumber: string;
  accountSID: string;
  authToken: string;
  verify: {
    active: boolean;
    serviceSid: string;
  };
}

export enum ISmsProviders {
  twilio = 'twilio',
}

export interface ISmsConfig {
  active: boolean;
  providerName: ISmsProviders;
  twilio: TwilioConfig;
}

export interface ISendSms {
  message: string;
  to: string;
}
