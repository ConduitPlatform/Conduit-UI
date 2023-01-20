export interface AuthzResourceType {
  body: string;
  name: string;
  subject: string;
  variables: string[];
  sender?: string;
  externalManaged: boolean;
  _id?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface AuthzRelationType {
  body: string;
  name: string;
  subject: string;
  variables: string[];
  sender?: string;
  externalManaged: boolean;
  _id?: string;
  updatedAt?: string;
  createdAt?: string;
}
export interface IAuthorizationConfig {
  active: boolean;
}

export interface AuthorizationUI {
  _id: string;
  Name: string;
  'Updated At': string;
}
