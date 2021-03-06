export interface FormsModel {
  _id?: string;
  name: string;
  fields: { [key: string]: string };
  forwardTo: string;
  emailField: string;
  enabled: boolean;
}

export interface FormReplies {
  _id: string;
  form: FormsModel;
  data: string;
  possibleSpam: boolean;
}

export interface IFormsConfig {
  active: boolean;
  useAttachments: boolean;
}

export interface FormsUI {
  _id: string;
  Name: string;
  Email: string;
  Enabled: string;
}
