'use client';

import { useEffect, useState } from 'react';
import { getUsers } from '@/lib/api/authentication';
import type { User } from '@/lib/models/User';

export type UserLookup = {
  status: 'loading' | 'loaded' | 'error';
  user?: User;
};

/** Uses the row when it was passed. Looks the id up only when it wasn't. */
export function useUserById(userId: string, user?: User): UserLookup {
  const [fetched, setFetched] = useState<User | undefined>();
  const [status, setStatus] = useState<UserLookup['status']>(
    user ? 'loaded' : 'loading'
  );

  useEffect(() => {
    if (user) return;
    let cancelled = false;
    setStatus('loading');
    getUsers(0, 5, { search: userId })
      .then(data => {
        if (cancelled) return;
        const found = data.users.find(item => item._id === userId);
        if (!found) {
          setStatus('error');
          return;
        }
        setFetched(found);
        setStatus('loaded');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [user, userId]);

  if (user) return { status: 'loaded', user };
  return { status, user: fetched };
}
