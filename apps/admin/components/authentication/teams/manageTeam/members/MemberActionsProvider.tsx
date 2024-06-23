'use client';
import * as React from 'react';
import { useContext } from 'react';
import { AddMemberSheet } from '@/components/authentication/teams/manageTeam/members/addMemberSheet/addMemberSheet';

type MemberActionsProvider = {
  openMemberAdd: () => void
  openMemberEdit: (userId: string) => void
}

const initialState: MemberActionsProvider = {
  openMemberAdd: () => {
    throw new Error('Not implemented');
  },
  openMemberEdit: (userId: string) => {
    throw new Error('Not implemented');
  },
};

const MemberActionsContext = React.createContext(initialState);
export const useMemberActions = () => useContext(MemberActionsContext);

export function MemberActionsProvider({ children }: { children: React.ReactNode }) {
  const [memberAdd, setMemberAdd] = React.useState<boolean>(false);
  const [memberEdit, setMemberEdit] = React.useState<string | undefined>(undefined);
  const openMemberAdd = () => {
    setMemberAdd(true);
  };
  const openMemberEdit = (userId: string) => {
    setMemberEdit(userId);
  };

  return <MemberActionsContext.Provider
    value={{
      openMemberAdd,
      openMemberEdit,
    }}
  >
    <AddMemberSheet defaultOpen={memberAdd} onClose={() => setMemberAdd(false)} />
    <AddMemberSheet defaultOpen={memberEdit !== undefined} />

    {children}
  </MemberActionsContext.Provider>;
}
