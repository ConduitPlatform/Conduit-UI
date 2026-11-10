import { describe, expect, it } from 'vitest';
import { userVerificationPatch } from '@/lib/authentication/userVerification';

describe('userVerificationPatch', () => {
  const user = {
    email: 'ann@acme.test',
    hasTwoFA: true,
    phoneNumber: '+15551212',
  };

  it('sends isVerified with the email and the 2FA fields the handler would otherwise clear', () => {
    expect(userVerificationPatch(user, true)).toEqual({
      email: 'ann@acme.test',
      isVerified: true,
      hasTwoFA: true,
      phoneNumber: '+15551212',
    });
    expect(userVerificationPatch(user, false).isVerified).toBe(false);
  });

  it('omits an empty phone number and still sends a known hasTwoFA flag', () => {
    expect(
      userVerificationPatch(
        { email: 'ann@acme.test', hasTwoFA: false, phoneNumber: undefined },
        false
      )
    ).toEqual({
      email: 'ann@acme.test',
      isVerified: false,
      hasTwoFA: false,
    });
  });
});
