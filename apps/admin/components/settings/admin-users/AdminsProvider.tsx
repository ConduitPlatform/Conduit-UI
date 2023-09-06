'use client';
import * as React from 'react';
import { useContext } from 'react';
import { AddAdminSheet } from '@/components/settings/admin-users/AddAdminSheet';

type UserActionsProvider = {
  openUserAdd: () => void
  openUserEdit: (userId: string) => void
}

const initialState: UserActionsProvider = {
  openUserAdd: () => {
    throw new Error('Not implemented');
  },
  openUserEdit: (userId: string) => {
    throw new Error('Not implemented');
  },
};

const AdminActionsContext = React.createContext(initialState);
export const useAdminActions = () => useContext(AdminActionsContext);

export function AdminActionsProvider({ children }: { children: React.ReactNode }) {
  const [userAdd, setUserAdd] = React.useState<boolean>(false);
  const [userEdit, setUserEdit] = React.useState<string | undefined>(undefined);
  const openUserAdd = () => {
    setUserAdd(true);
  };
  const openUserEdit = (userId: string) => {
    setUserEdit(userId);
  };

  return <AdminActionsContext.Provider
    value={{
      openUserAdd,
      openUserEdit,
    }}
  >
    <AddAdminSheet defaultOpen={userAdd} onClose={() => setUserAdd(false)} />
    <AddAdminSheet defaultOpen={userEdit !== undefined} />

    {children}
  </AdminActionsContext.Provider>;
}