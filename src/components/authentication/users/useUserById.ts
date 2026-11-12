'use client';

import { useEffect, useState } from 'react';
import { getUserById, getUsers } from '@/lib/api/authentication';
import {
  LEGACY_CAPABILITIES,
  canGetUserById,
  type UserAdminCapabilities,
} from '@/lib/authentication/userCapabilities';
import type { User } from '@/lib/models/User';

export type UserLookup = {
  status: 'loading' | 'loaded' | 'error';
  user?: User;
};

/** `GET /authentication/users/:id`. A missing user or any failure resolves to nothing. */
async function fetchById(userId: string): Promise<User | undefined> {
  const result = await getUserById(userId);
  return result.ok ? result.data : undefined;
}

/**
 * For backends without the id route. The list search matches an id only when
 * it is a Mongo ObjectId, so other id formats are not found this way.
 */
async function searchById(userId: string): Promise<User | undefined> {
  const data = await getUsers(0, 5, { search: userId });
  return data.users.find(item => item._id === userId);
}

/** Uses the row when it was passed. Looks the id up only when it wasn't. */
export function useUserById(
  userId: string,
  user?: User,
  capabilities: UserAdminCapabilities = LEGACY_CAPABILITIES
): UserLookup {
  const [fetched, setFetched] = useState<User | undefined>();
  const [status, setStatus] = useState<UserLookup['status']>(
    user ? 'loaded' : 'loading'
  );
  const byId = canGetUserById(capabilities);

  useEffect(() => {
    if (user) return;
    let cancelled = false;
    setStatus('loading');
    (byId ? fetchById(userId) : searchById(userId))
      .then(found => {
        if (cancelled) return;
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
  }, [byId, user, userId]);

  if (user) return { status: 'loaded', user };
  return { status, user: fetched };
}
