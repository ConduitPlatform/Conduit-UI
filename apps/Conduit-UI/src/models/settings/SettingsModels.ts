export interface INewAdminUser {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface IPasswordChange {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IAdminSettings {
  auth: {
    tokenSecret: string;
    hashRounds: number;
    tokenExpirationTime: number;
  };
  hostUrl: string;
  transports: { rest: boolean; graphql: boolean; sockets: boolean };
}

export interface ICoreSettings {
  env: string;
}

export interface IAdmin {
  createdAt: string;
  email: string;
  username: string;
  updatedAt: string;
  _id: string;
}

export interface AuthUserUI {
  _id: string;
  username: string;
  'Registered At': string;
}
