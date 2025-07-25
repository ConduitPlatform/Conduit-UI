export type NotificationSettings = {
  active: boolean;
  providerName: 'firebase' | 'oneSignal' | 'sns' | 'basic';
  firebase?: FirebaseSettings;
  onesignal?: OneSignalSettings;
  sns?: SNSSettings;
  message?: string;
};

export type FirebaseSettings = {
  projectId: string;
  privateKey: string;
  clientEmail: string;
};

export type OneSignalSettings = {
  appId: string;
  apiKey: string;
};

export type SNSSettings = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  gcmApplicationArn: string;
  apnsApplicationArn: string;
};
