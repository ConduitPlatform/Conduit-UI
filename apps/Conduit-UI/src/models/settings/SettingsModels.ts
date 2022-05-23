export interface INewAdminUser {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface ICoreSettings {
  env: string;
  hostUrl: string;
  transports: { rest: { enabled: boolean }; graphql: { enabled: boolean } };
  port: number;
}
