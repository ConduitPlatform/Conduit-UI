import { describe, expect, it } from 'vitest';
import { userPatch } from '@/lib/authentication/userPatch';

describe('userPatch', () => {
  const user = {
    email: 'Ann@Acme.TEST',
    isVerified: true,
    hasTwoFA: true,
    phoneNumber: '+15551212',
    customField: 'x',
    hashedPassword: 'secret',
    google: { id: 'g' },
  };

  it('never copies fields the authentication module does not own', () => {
    expect(userPatch(user, { isVerified: false })).toEqual({
      email: 'ann@acme.test',
      isVerified: false,
      hasTwoFA: true,
      phoneNumber: '+15551212',
    });
    expect(
      Object.keys(
        userPatch(user, { email: 'New@Acme.TEST', isVerified: true })
      ).sort()
    ).toEqual(['email', 'hasTwoFA', 'isVerified', 'phoneNumber']);
  });

  it('omits email when the account has none and can clear the phone', () => {
    const emailLess = {
      hasTwoFA: true,
      phoneNumber: '+15551212',
      customField: 'x',
    };
    expect(userPatch(emailLess, { hasTwoFA: false })).toEqual({
      hasTwoFA: false,
      phoneNumber: '+15551212',
    });
    expect(
      userPatch(
        { email: 'ann@acme.test', hasTwoFA: false },
        { phoneNumber: '' }
      )
    ).toEqual({
      email: 'ann@acme.test',
      hasTwoFA: false,
      phoneNumber: '',
    });
  });

  it('sends only the changed fields to a backend that patches what it is sent', () => {
    expect(
      userPatch(user, { isVerified: false }, { changesOnly: true })
    ).toEqual({ isVerified: false });
    expect(
      userPatch(
        user,
        { email: ' New@Acme.TEST ', isVerified: true },
        { changesOnly: true }
      )
    ).toEqual({ email: 'new@acme.test', isVerified: true });
    expect(userPatch(user, { phoneNumber: '' }, { changesOnly: true })).toEqual(
      { phoneNumber: '' }
    );
    expect(userPatch(user, { hasTwoFA: false }, { changesOnly: true })).toEqual(
      { hasTwoFA: false }
    );
  });
});
