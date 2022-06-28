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

export interface ICoreSettings {
  env: string;
  hostUrl: string;
  transports: { rest: { enabled: boolean }; graphql: { enabled: boolean }; sockets: boolean };
  port: number;
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
