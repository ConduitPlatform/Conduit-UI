interface IWebInputsInterface {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  event?: string;
  bodyParams?: { [key: string]: any };
  urlParams?: { [key: string]: any };
  queryParams?: { [key: string]: any };
  auth?: boolean;
}

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
  inputs?: IWebInputsInterface;
  returns?: { [key: string]: any };
  timeout?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type FunctionExecutionModel = {
  _id: string;
  function: string | FunctionModel;
  duration: number;
  success: boolean;
  error?: { [key: string]: any };
  logs?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
};
