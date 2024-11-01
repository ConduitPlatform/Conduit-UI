import { ModulesTypes } from '@/lib/models/logs-viewer';

export type Module = {
  moduleName: ModulesTypes;
  url: string;
  serving: boolean;
};
