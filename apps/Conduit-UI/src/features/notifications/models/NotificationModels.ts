export interface NotificationData {
  userIds: string[];
  title: string;
  body: string;
  isSilent: boolean;
}

export interface INotificationConfig {
  active: boolean;
  providerName: string;
  firebase?: FirebaseSettings;
  onesignal?: OneSignalSettings;
  message?: string;
}

export enum INotificationProviders {
  firebase = 'firebase',
  onesignal = 'onesignal',
}

export interface INotificationProviderSettings {
  firebase: FirebaseSettings;
  onesignal: OneSignalSettings;
}

export interface FirebaseSettings {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

export interface OneSignalSettings {
  appId: string;
  apiKey: string;
}
