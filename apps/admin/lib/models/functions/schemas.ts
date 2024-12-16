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

export type FunctionExecutionModel = {
  _id: string;
  functionName: string;
  duration: number;
  success: boolean;
  error?: { [key: string]: any };
  logs?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
};
