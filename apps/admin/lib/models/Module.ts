import { knownModuleNames } from './logs-viewer/constants';

export type Module = {
  moduleName: (typeof knownModuleNames)[number];
  url: string;
  serving: boolean;
};
