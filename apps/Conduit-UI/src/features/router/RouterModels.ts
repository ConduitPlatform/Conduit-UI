export interface IRouterConfig {
  hostUrl: string;
  transports: { rest: boolean; graphql: boolean; sockets: boolean };
  security: { clientValidation: boolean };
}
