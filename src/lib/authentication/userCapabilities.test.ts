import { describe, expect, it } from 'vitest';
import {
  LEGACY_CAPABILITIES,
  hasAction,
  hasFilter,
  normalizeCapabilities,
  patchesOnlySentFields,
  USER_ADMIN_CAPABILITIES_V1,
} from '@/lib/authentication/userCapabilities';

describe('user capabilities', () => {
  it('treats a missing or malformed probe as a legacy backend', () => {
    expect(normalizeCapabilities(undefined)).toEqual(LEGACY_CAPABILITIES);
    expect(normalizeCapabilities({ version: '1' })).toEqual({
      version: 0,
      filters: [],
      sort: [],
      actions: [],
    });
    expect(hasAction(LEGACY_CAPABILITIES, 'setPassword')).toBe(false);
    expect(hasFilter(LEGACY_CAPABILITIES, 'isVerified')).toBe(false);
  });

  it('keeps the lists a current backend advertises', () => {
    const capabilities = normalizeCapabilities({
      version: 1,
      filters: ['isVerified', 'providerPhone'],
      sort: ['email'],
      actions: ['setPassword', 'userTeams'],
    });
    expect(hasFilter(capabilities, 'isVerified')).toBe(true);
    expect(hasFilter(capabilities, 'hasTwoFA')).toBe(false);
    expect(hasAction(capabilities, 'setPassword')).toBe(true);
    expect(hasAction(capabilities, 'clearPhone')).toBe(false);
  });

  it('resends unchanged fields only to a legacy backend', () => {
    expect(patchesOnlySentFields(LEGACY_CAPABILITIES)).toBe(false);
    expect(patchesOnlySentFields(USER_ADMIN_CAPABILITIES_V1)).toBe(true);
  });
});
