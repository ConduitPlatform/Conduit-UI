export type FunctionModel = {
  _id: string;
  name: string;
  functionCode: string;
  functionType:
    | 'request'
    | 'webhook'
    | 'middleware'
    | 'socket'
    | 'event'
    | 'cron';
  inputs?: string;
  returns?: string;
  timeout?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
};
