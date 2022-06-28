export interface IClient {
  _id: string;
  clientId: string;
  clientSecret: string;
  domain: string;
  platform: ClientPlatformEnum;
  notes?: string;
  alias?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUpdateClient {
  domain?: string;
  notes?: string;
  alias?: string;
}

export interface ICreateClient {
  domain: string;
  platform: ClientPlatformEnum;
  notes?: string;
  alias?: string;
}

enum ClientPlatformEnum {
  WEB = 'WEB',
  ANDROID = 'ANDROID',
  IOS = 'IOS',
  IPADOS = 'IPADOS',
  WINDOWS = 'WINDOWS',
  MACOS = 'MACOS',
  LINUX = 'LINUX',
  CLI = 'CLI',
}
export default ClientPlatformEnum;

export interface ISecurityConfig {
  hostUrl: string;
  transports: { rest: boolean; graphql: boolean; sockets: boolean };
  security: { clientValidation: boolean };
}
