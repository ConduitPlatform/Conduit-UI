'use client';
import * as React from 'react';
import { useContext, useMemo } from 'react';
import { AddUserSheet } from '@/components/authentication/users/addUserSheet/addUserSheet';

type UserActionsProvider = {
  openUserAdd: () => void;
  openUserEdit: (userId: string) => void;
};

const initialState: UserActionsProvider = {
  openUserAdd: () => {
    throw new Error('Not implemented');
  },
  openUserEdit: (userId: string) => {
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
  const [userAdd, setUserAdd] = React.useState<boolean>(false);
  const [userEdit, setUserEdit] = React.useState<string | undefined>(undefined);
  const openUserAdd = () => {
    setUserAdd(true);
  };
  const openUserEdit = (userId: string) => {
    setUserEdit(userId);
  };

  const contextValues = useMemo(
    () => ({
      openUserAdd,
      openUserEdit,
    }),
    []
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
