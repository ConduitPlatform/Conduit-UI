'use client';

import { useCallback } from 'react';
import { updateUser } from '@/lib/api/authentication';
import {
  userVerificationPatch,
  type UserVerificationTarget,
} from '@/lib/authentication/userVerification';
import { useUserMutation } from '@/components/authentication/users/useUserMutation';

type VerificationPrompt = {
  title: string;
  description: string;
  action: string;
  successTitle: string;
  successDescription: string;
  failureDescription: string;
};

function verificationPrompt(
  email: string,
  isVerified: boolean
): VerificationPrompt {
  if (isVerified) {
    return {
      title: 'Verify user',
      description: `Are you sure you want to verify ${email}? They will be treated as having a confirmed email.`,
      action: 'Verify',
      successTitle: 'User verified',
      successDescription: `${email} is verified.`,
      failureDescription: 'User could not be verified.',
    };
  }
  return {
    title: 'Unverify user',
    description: `Are you sure you want to remove verification from ${email}?`,
    action: 'Unverify',
    successTitle: 'User unverified',
    successDescription: `${email} is no longer verified.`,
    failureDescription: 'User could not be unverified.',
  };
}

/** Confirms, then `PATCH /authentication/users/:id` with `isVerified`. Resolves true when the user was updated. */
export function useSetUserVerified() {
  const { run } = useUserMutation();

  return useCallback(
    (user: UserVerificationTarget, isVerified: boolean) => {
      const prompt = verificationPrompt(user.email || user._id, isVerified);
      return run({
        confirm: {
          title: prompt.title,
          description: prompt.description,
          actionText: prompt.action,
        },
        perform: () =>
          updateUser(user._id, userVerificationPatch(user, isVerified)),
        success: {
          title: prompt.successTitle,
          description: prompt.successDescription,
        },
        failure: {
          title: 'Failed',
          description: prompt.failureDescription,
        },
      }).then(outcome => outcome.ok);
    },
    [run]
  );
}
