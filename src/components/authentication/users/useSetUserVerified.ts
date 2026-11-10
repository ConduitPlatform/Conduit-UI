'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAlerts } from '@/components/providers/AlertProvider';
import { patchUser } from '@/lib/api/authentication';
import {
  userVerificationPatch,
  type UserVerificationTarget,
} from '@/lib/authentication/userVerification';
import { toast } from '@/lib/hooks/use-toast';

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
  const { addAlert } = useAlerts();
  const router = useRouter();

  return useCallback(
    (user: UserVerificationTarget, isVerified: boolean) =>
      new Promise<boolean>(resolve => {
        const prompt = verificationPrompt(user.email, isVerified);
        addAlert({
          title: prompt.title,
          description: prompt.description,
          cancelText: 'Cancel',
          actionText: prompt.action,
          onDecision: cancel => {
            if (cancel) {
              resolve(false);
              return;
            }
            patchUser(user._id, userVerificationPatch(user, isVerified))
              .then(() => {
                toast({
                  title: prompt.successTitle,
                  description: prompt.successDescription,
                  variant: 'default',
                });
                router.refresh();
                resolve(true);
              })
              .catch(() => {
                toast({
                  title: 'Failed',
                  description: prompt.failureDescription,
                  variant: 'destructive',
                });
                resolve(false);
              });
          },
        });
      }),
    [addAlert, router]
  );
}
