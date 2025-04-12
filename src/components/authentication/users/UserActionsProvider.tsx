'use client';
import * as React from 'react';
import { useCallback, useContext, useMemo } from 'react';
import { AddUserSheet } from '@/components/authentication/users/addUserSheet/addUserSheet';
import { useAlerts } from '@/components/providers/AlertProvider';
import { blockUnblockUser, deleteUser } from '@/lib/api/authentication';
import { toast } from '@/lib/hooks/use-toast';

type UserActionsProvider = {
  openUserAdd: () => void;
  openUserEdit: (userId: string) => void;
  deleteUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
};

const initialState: UserActionsProvider = {
  openUserAdd: () => {
    throw new Error('Not implemented');
  },
  openUserEdit: (userId: string) => {
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
};

const UserActionsContext = React.createContext(initialState);
export const useUserActions = () => useContext(UserActionsContext);

export function UserActionsProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { addAlert } = useAlerts();
  const [userAdd, setUserAdd] = React.useState<boolean>(false);
  const [userEdit, setUserEdit] = React.useState<string | undefined>(undefined);
  const openUserAdd = () => {
    setUserAdd(true);
  };
  const openUserEdit = (userId: string) => {
    setUserEdit(userId);
  };
  const _deleteUser = useCallback(
    (userId: string) => {
      addAlert({
        title: 'Delete User',
        description:
          'Are you sure you want to delete this user? This action cannot be undone.',
        cancelText: 'Cancel',
        actionText: 'Delete',
        onDecision: cancel => {
          if (cancel) return;
          deleteUser(userId)
            .then(() => {
              toast({
                title: 'User deleted',
                description: 'The user has been deleted successfully.',
                variant: 'default',
              });
            })
            .catch(() => {
              toast({
                title: 'Failed',
                description: 'User could not be deleted.',
                variant: 'destructive',
              });
            });
        },
      });
    },
    [addAlert]
  );
  const blockUser = useCallback(
    (userId: string) => {
      addAlert({
        title: 'Block User',
        description:
          "Are you sure you want to block this user? They won't be able to login until you unblock them.",
        cancelText: 'Cancel',
        actionText: 'Block',
        onDecision: cancel => {
          if (cancel) return;
          blockUnblockUser(userId, true)
            .then(() => {
              toast({
                title: 'User blocked',
                description: 'The user has been blocked successfully.',
                variant: 'default',
              });
            })
            .catch(() => {
              toast({
                title: 'Failed',
                description: 'User could not be blocked.',
                variant: 'destructive',
              });
            });
        },
      });
    },
    [addAlert]
  );
  const unblockUser = useCallback(
    (userId: string) => {
      addAlert({
        title: 'Unblock User',
        description:
          'Are you sure you want to unblock this user? They will be able to login.',
        cancelText: 'Cancel',
        actionText: 'Unblock',
        onDecision: cancel => {
          if (cancel) return;
          blockUnblockUser(userId, false)
            .then(() => {
              toast({
                title: 'User unblocked',
                description: 'The user has been unblocked successfully.',
                variant: 'default',
              });
            })
            .catch(() => {
              toast({
                title: 'Failed',
                description: 'User could not be unblocked.',
                variant: 'destructive',
              });
            });
        },
      });
    },
    [addAlert]
  );

  const contextValues = useMemo(
    () => ({
      openUserAdd,
      openUserEdit,
      deleteUser: _deleteUser,
      blockUser,
      unblockUser,
    }),
    [_deleteUser, blockUser, unblockUser]
  );

  return (
    <UserActionsContext.Provider value={contextValues}>
      <AddUserSheet defaultOpen={userAdd} onClose={() => setUserAdd(false)} />
      <AddUserSheet
        defaultOpen={userEdit !== undefined}
        onClose={() => setUserEdit(undefined)}
      />
      {children}
    </UserActionsContext.Provider>
  );
}
