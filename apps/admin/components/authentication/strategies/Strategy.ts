export type Strategy = {
  name: string;
  description: string;
  supports: {
    login: boolean;
    register: boolean;
  };
  oauth?: {
    redirect: boolean;
    native: boolean;
  };
  documentation: string;
}
