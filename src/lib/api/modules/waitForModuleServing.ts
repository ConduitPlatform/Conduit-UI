'use server';

import { Module } from '@/lib/models/Module';
import { getModules } from '@/lib/api/modules';

export type WaitForModuleServingOptions = {
  moduleNames: string[];
  expectedServing: boolean;
  intervalMs?: number;
  timeoutMs?: number;
};

export type WaitForModuleServingResult = {
  modules: Module[];
  activated: boolean;
  timedOut: boolean;
};

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function matchesServingState(
  modules: Module[],
  moduleNames: string[],
  expectedServing: boolean
): boolean {
  if (expectedServing) {
    return moduleNames.some(
      name => modules.find(m => m.moduleName === name)?.serving === true
    );
  }
  return moduleNames.every(
    name => modules.find(m => m.moduleName === name)?.serving !== true
  );
}

export async function waitForModuleServing(
  options: WaitForModuleServingOptions
): Promise<WaitForModuleServingResult> {
  const {
    moduleNames,
    expectedServing,
    intervalMs = 300,
    timeoutMs = 10_000,
  } = options;

  const deadline = Date.now() + timeoutMs;
  let modules = await getModules();

  if (matchesServingState(modules, moduleNames, expectedServing)) {
    return {
      modules,
      activated: expectedServing,
      timedOut: false,
    };
  }

  while (Date.now() < deadline) {
    await sleep(intervalMs);
    modules = await getModules();
    if (matchesServingState(modules, moduleNames, expectedServing)) {
      return {
        modules,
        activated: expectedServing,
        timedOut: false,
      };
    }
  }

  return {
    modules,
    activated: false,
    timedOut: true,
  };
}
