'use client';
import * as React from 'react';
import { useCallback, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AddUserSheet } from '@/components/authentication/users/addUserSheet/addUserSheet';
import { EditUserSheet } from '@/components/authentication/users/editUserSheet/editUserSheet';
import { useSetUserVerified } from '@/components/authentication/users/useSetUserVerified';
import { blockUserResult, deleteUserResult } from '@/lib/api/authentication';
import {
  LEGACY_CAPABILITIES,
  type UserAdminCapabilities,
} from '@/lib/authentication/userCapabilities';
import type { UserVerificationTarget } from '@/lib/authentication/userVerification';
import type { RealmIdentityMode } from '@/lib/models/authentication/teams.config';
import type { User } from '@/lib/models/User';
import { useUserMutation } from '@/components/authentication/users/useUserMutation';

type UserActionsProvider = {
  openUserAdd: () => void;
  /** Opens the edit sheet for this user. The row is read from the current page. */
  openUserEdit: (userId: string) => void;
  deleteUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  /** Resolves true when `isVerified` was saved. */
  setUserVerified: (
    user: UserVerificationTarget,
    isVerified: boolean
  ) => Promise<boolean>;
  capabilities: UserAdminCapabilities;
  bulkRunning: boolean;
  setBulkRunning: (running: boolean) => void;
};

const initialState: UserActionsProvider = {
  openUserAdd: () => {
    throw new Error('Not implemented');
  },
  openUserEdit: () => {
    throw new Error('Not implemented');
  },
  deleteUser: (userId: string) => {
    throw new Error('Not implemented');
  },
  blockUser: (userId: string) => {
    throw new Error('Not implemented');
  },
  unblockUser: (userId: string) => {
    throw new Error('Not implemented');
  },
  setUserVerified: () => {
    throw new Error('Not implemented');
  },
  capabilities: LEGACY_CAPABILITIES,
  bulkRunning: false,
  setBulkRunning: () => undefined,
};

const UserActionsContext = React.createContext(initialState);
export const useUserActions = () => useContext(UserActionsContext);

const NO_REALMS: ReadonlyMap<string, string> = new Map();

export function UserActionsProvider({
  children,
  realmsEnabled = false,
  realmSlugs = NO_REALMS,
  identityMode = 'shared',
  capabilities = LEGACY_CAPABILITIES,
  teamsEnabled = false,
  users = [],
}: Readonly<{
  children: React.ReactNode;
  /** Realm UI (home realm select, edit sheet) renders only when enabled. */
  realmsEnabled?: boolean;
  /** `teamId -> slug` of every realm. */
  realmSlugs?: ReadonlyMap<string, string>;
  identityMode?: RealmIdentityMode;
  capabilities?: UserAdminCapabilities;
  teamsEnabled?: boolean;
  /** Current page, so the edit sheet follows a refresh without copying the row. */
  users?: readonly User[];
}>) {
  const router = useRouter();
  const setUserVerified = useSetUserVerified();
  const { run } = useUserMutation();
  const [userAdd, setUserAdd] = React.useState<boolean>(false);
  const [editingId, setEditingId] = React.useState<string | undefined>();
  const [bulkRunning, setBulkRunningState] = React.useState(false);
  const setBulkRunning = useCallback((running: boolean) => {
    setBulkRunningState(running);
  }, []);
  const openUserAdd = () => {
    setUserAdd(true);
  };
  const openUserEdit = (userId: string) => {
    setEditingId(userId);
  };
  const editingUser = editingId
    ? users.find(user => user._id === editingId)
    : undefined;
  const _deleteUser = useCallback(
    (userId: string) => {
      void run({
        confirm: {
          title: 'Delete User',
          description:
            'Are you sure you want to delete this user? This action cannot be undone.',
          actionText: 'Delete',
          variant: 'destructive',
        },
        perform: () => deleteUserResult(userId),
        success: {
          title: 'User deleted',
          description: 'The user has been deleted successfully.',
        },
        failure: {
          title: 'Failed',
          description: 'User could not be deleted.',
        },
      });
    },
    [run]
  );
  const blockUser = useCallback(
    (userId: string) => {
      void run({
        confirm: {
          title: 'Block User',
          description:
            "Are you sure you want to block this user? They won't be able to login until you unblock them.",
          actionText: 'Block',
        },
        perform: () => blockUserResult(userId, true),
        success: {
          title: 'User blocked',
          description: 'The user has been blocked successfully.',
        },
        failure: {
          title: 'Failed',
          description: 'User could not be blocked.',
        },
      });
    },
    [run]
  );
  const unblockUser = useCallback(
    (userId: string) => {
      void run({
        confirm: {
          title: 'Unblock User',
          description:
            'Are you sure you want to unblock this user? They will be able to login.',
          actionText: 'Unblock',
        },
        perform: () => blockUserResult(userId, false),
        success: {
          title: 'User unblocked',
          description: 'The user has been unblocked successfully.',
        },
        failure: {
          title: 'Failed',
          description: 'User could not be unblocked.',
        },
      });
    },
    [run]
  );

  const contextValues = useMemo(
    () => ({
      openUserAdd,
      openUserEdit,
      deleteUser: _deleteUser,
      blockUser,
      unblockUser,
      setUserVerified,
      capabilities,
      bulkRunning,
      setBulkRunning,
    }),
    [
      _deleteUser,
      blockUser,
      bulkRunning,
      capabilities,
      setBulkRunning,
      setUserVerified,
      unblockUser,
    ]
  );

  return (
    <UserActionsContext.Provider value={contextValues}>
      <AddUserSheet
        defaultOpen={userAdd}
        onClose={() => setUserAdd(false)}
        realmsEnabled={realmsEnabled}
        realmSlugs={realmSlugs}
        identityMode={identityMode}
        onSuccess={() => router.refresh()}
      />
      {editingId && (
        <EditUserSheet
          key={editingId}
          userId={editingId}
          user={editingUser}
          open
          onOpenChange={open => {
            if (!open) setEditingId(undefined);
          }}
          realmSlugs={realmSlugs}
          realmsEnabled={realmsEnabled}
          capabilities={capabilities}
          teamsEnabled={teamsEnabled}
          bulkRunning={bulkRunning}
        />
      )}
      {children}
    </UserActionsContext.Provider>
  );
}
