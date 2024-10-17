import { ModulesTypes } from './logs-viewer';

export type Module = {
  moduleName: ModulesTypes;
  url: string;
  serving: boolean;
};
