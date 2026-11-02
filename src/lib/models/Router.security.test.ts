import { describe, expect, it } from 'vitest';
import {
  encodeStandardBase64,
  generateClientSecretEncryptionKey,
  REDACTED_CONFIG_VALUE,
  securitySettingsPatch,
  type SecuritySettings,
} from './Router';

const security = (
  clientSecretEncryptionKey: string,
  clientSignaturePathPrefix = '/api'
): SecuritySettings => ({
  clientValidation: true,
  clientSecretEncryptionKey,
  clientSignaturePathPrefix,
});

describe('securitySettingsPatch', () => {
  it('omits an untouched redacted key and still saves the path prefix', () => {
    const patch = securitySettingsPatch(
      security(REDACTED_CONFIG_VALUE, '/api'),
      false
    );
    expect(patch).toEqual({
      clientValidation: true,
      clientSignaturePathPrefix: '/api',
    });
    expect(patch).not.toHaveProperty('clientSecretEncryptionKey');
  });

  it('omits an untouched empty key so a fresh install does not clear or store the marker', () => {
    const patch = securitySettingsPatch(security(''), false);
    expect(patch).not.toHaveProperty('clientSecretEncryptionKey');
  });

  it('omits a typed redacted marker', () => {
    const patch = securitySettingsPatch(security(REDACTED_CONFIG_VALUE), true);
    expect(patch).not.toHaveProperty('clientSecretEncryptionKey');
  });

  it('sends a typed or generated key', () => {
    const key = 'A'.repeat(43) + '=';
    expect(securitySettingsPatch(security(key), true)).toMatchObject({
      clientSecretEncryptionKey: key,
      clientSignaturePathPrefix: '/api',
    });
  });

  it('sends an empty string when the field was cleared', () => {
    expect(
      securitySettingsPatch(security(''), true).clientSecretEncryptionKey
    ).toBe('');
  });
});

describe('generateClientSecretEncryptionKey', () => {
  it('encodes 32 bytes as standard base64', () => {
    const key = generateClientSecretEncryptionKey(() =>
      new Uint8Array(32).fill(7)
    );
    expect(key).toHaveLength(44);
    expect(key.endsWith('=')).toBe(true);
    expect(key.includes('-') || key.includes('_')).toBe(false);
    expect(Buffer.from(key, 'base64')).toEqual(Buffer.alloc(32, 7));
    expect(encodeStandardBase64(new Uint8Array(32))).toBe(
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
    );
  });

  it('uses crypto.getRandomValues for 32 bytes', () => {
    const key = generateClientSecretEncryptionKey();
    expect(key).toHaveLength(44);
    expect(key.endsWith('=')).toBe(true);
    expect(Buffer.from(key, 'base64')).toHaveLength(32);
  });
});
