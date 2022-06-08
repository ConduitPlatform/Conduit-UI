export interface IClient {
  _id: string;
  clientId: string;
  clientSecret: string;
  domain: string;
  platform: IPlatformTypes;
  notes: string;
  alias: string;
  createdAt: string;
  updatedAt: string;
}

export type IPlatformTypes = 'WEB' | 'ANDROID' | 'IOS' | 'IPADOS' | 'WINDOWS' | 'MACOS' | 'LINUX';

export interface ISecurityConfig {
  clientValidation: {
    enabled: boolean;
  };
}
