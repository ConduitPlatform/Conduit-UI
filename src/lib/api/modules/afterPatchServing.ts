'use server';

import {
  PatchSettingsOptions,
  PatchSettingsResult,
} from '@/lib/api/modules/patch-settings-options';
import { waitForModuleServing } from '@/lib/api/modules/waitForModuleServing';

export async function afterPatchServing(
  options?: PatchSettingsOptions
): Promise<PatchSettingsResult | void> {
  if (!options?.waitForServing || !options.moduleNames?.length) {
    return;
  }

  return waitForModuleServing({
    moduleNames: options.moduleNames,
    expectedServing: options.expectedServing ?? true,
  });
}
