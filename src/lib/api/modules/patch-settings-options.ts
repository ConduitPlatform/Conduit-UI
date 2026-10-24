import { Module } from '@/lib/models/Module';
import { WaitForModuleServingResult } from '@/lib/api/modules/waitForModuleServing';

export type PatchSettingsOptions = {
  waitForServing?: boolean;
  expectedServing?: boolean;
  moduleNames?: string[];
};

export type PatchSettingsResult = WaitForModuleServingResult & {
  modules: Module[];
};

export const COMMUNICATIONS_MODULE_NAMES = [
  'communications',
  'email',
  'sms',
  'pushNotifications',
] as const;

export function isCommunicationsModuleServing(
  modules: Module[],
  aliases: readonly string[] = COMMUNICATIONS_MODULE_NAMES
): boolean {
  return aliases.some(
    name => modules.find(m => m.moduleName === name)?.serving === true
  );
}

export function isModuleServing(
  modules: Module[],
  moduleName: string
): boolean {
  return modules.find(m => m.moduleName === moduleName)?.serving === true;
}
