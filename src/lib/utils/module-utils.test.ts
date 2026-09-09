import { describe, expect, it } from 'vitest';
import { navGroups } from '@/components/navigation/navList.config';
import type { Module } from '@/lib/models/Module';
import {
  filterNavigationByModules,
  getApiModuleNameFromPath,
  getLokiModuleFilterForPath,
  MODULE_DISPLAY_NAMES,
  MODULE_NAME_TO_URL,
  MODULE_URL_TO_NAME,
} from '@/lib/utils/module-utils';

const MODULE_PATHS = Object.keys(MODULE_URL_TO_NAME);
const NAV_MODULE_URLS = navGroups.flatMap(group =>
  group.items.flatMap(item => [
    item.url,
    ...(item.items?.map(sub => sub.url) ?? []),
  ])
);

function modules(...names: string[]): Module[] {
  return names.map(moduleName => ({
    moduleName,
    url: `${moduleName}:1`,
    serving: true,
  }));
}

describe('module path maps', () => {
  it('keeps URL, API name, and display maps aligned for every module path', () => {
    for (const url of MODULE_PATHS) {
      const apiName = MODULE_URL_TO_NAME[url];
      expect(apiName.length).toBeGreaterThan(0);
      expect(MODULE_NAME_TO_URL[apiName]).toBe(url.slice(1));
      expect(
        MODULE_DISPLAY_NAMES[apiName] ?? MODULE_DISPLAY_NAMES[url.slice(1)]
      ).toBeTruthy();
    }
  });

  it('maps every navigation module URL through the same path filter', () => {
    for (const url of NAV_MODULE_URLS) {
      if (url === '/' || url === '/settings' || url === '/logs-viewer')
        continue;
      const apiName = getApiModuleNameFromPath(url);
      expect(apiName).toBeTruthy();
      expect(getLokiModuleFilterForPath(url).length).toBeGreaterThan(0);
    }
  });

  it('filters embeddings nested routes as the embeddings module', () => {
    expect(getApiModuleNameFromPath('/embeddings')).toBe('embeddings');
    expect(getApiModuleNameFromPath('/embeddings/configs')).toBe('embeddings');
    expect(getApiModuleNameFromPath('/embeddings/backfills/run_1')).toBe(
      'embeddings'
    );
    expect(getApiModuleNameFromPath('/embeddings/test')).toBe('embeddings');
    expect(getApiModuleNameFromPath('/embeddings/settings')).toBe('embeddings');
    expect(getLokiModuleFilterForPath('/embeddings/configs')).toEqual([
      'embeddings',
    ]);
    expect(getLokiModuleFilterForPath('/communications/test')).toEqual([
      'communications',
      'email',
      'sms',
      'pushNotifications',
    ]);
  });

  it('keeps embeddings in nav only when the module is registered', () => {
    const items = navGroups.flatMap(group => group.items);
    const withModule = filterNavigationByModules(items, modules('embeddings'));
    expect(withModule.some(item => item.url === '/embeddings')).toBe(true);
    const without = filterNavigationByModules(items, modules('database'));
    expect(without.some(item => item.url === '/embeddings')).toBe(false);
    expect(without.some(item => item.url === '/')).toBe(true);
  });
});
