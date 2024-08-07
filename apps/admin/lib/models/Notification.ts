export type NotificationSettings = {
  active: boolean;
  providerName: 'firebase' | 'oneSignal' | 'basic';
  firebase?: FirebaseSettings;
  onesignal?: OneSignalSettings;
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
