import { describe, expect, it } from 'vitest';
import {
  authenticationConfigFromModuleResponse,
  authenticationConfigFromMonoResponse,
  explainMissingConfigRoute,
  isUnregisteredConfigRoute,
  MISSING_AUTHENTICATION_CONFIG_ROUTE,
} from './module-config';

const authentication = {
  accessTokens: { expiryPeriod: 3600000 },
  teams: { enabled: true },
};

describe('authentication config payloads', () => {
  it('reads the per-module config route body', () => {
    expect(
      authenticationConfigFromModuleResponse({ config: authentication })
    ).toEqual(authentication);
  });

  it('reads authentication out of the monolithic config', () => {
    expect(
      authenticationConfigFromMonoResponse({
        config: {
          modules: {
            database: { readPreference: 'primary' },
            authentication,
          },
        },
      })
    ).toEqual(authentication);
  });

  it('recognizes an unregistered Express config route', () => {
    const missing = {
      response: {
        status: 404,
        data: '<pre>Cannot GET /config/authentication</pre>',
      },
    };
    expect(isUnregisteredConfigRoute(missing)).toBe(true);
    expect(() => explainMissingConfigRoute(missing)).toThrow(
      MISSING_AUTHENTICATION_CONFIG_ROUTE
    );
    expect(
      isUnregisteredConfigRoute({
        response: { status: 404, data: { message: 'Module not found' } },
      })
    ).toBe(false);
  });

  it('returns undefined when the monolithic config has no authentication module', () => {
    expect(
      authenticationConfigFromMonoResponse({
        config: { modules: { database: { readPreference: 'primary' } } },
      })
    ).toBeUndefined();
  });
});
