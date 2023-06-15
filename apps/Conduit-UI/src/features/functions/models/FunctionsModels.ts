export interface FunctionType {
  _id?: string;
  updatedAt?: string;
  createdAt?: string;
  name: string;
  functionCode: string;
  inputs: string;
  returns: string;
  timeout: number;
}

export interface IFunctionsConfig {
  active: boolean;
}

export interface FunctionData {
  name: string;
  functionCode: string;
  inputs: string;
  returns: string;
  timeout: number;
}

export interface TestFunctionData {
  functionId: string;
  inputs?: { [key: string]: string };
}

export interface EmailUI {
  _id: string;
  Name: string;
  'Updated At': string;
}
