'use client';
import * as React from 'react';
import { useContext } from 'react';

type MemberActionsProvider = {
  openMemberAdd: () => void;
  openMemberEdit: (userId: string) => void;
};

const initialState: MemberActionsProvider = {
  openMemberAdd: () => {
    throw new Error('Not implemented');
  },
  openMemberEdit: () => {
    throw new Error('Not implemented');
  },
};

const MemberActionsContext = React.createContext(initialState);
export const useMemberActions = () => useContext(MemberActionsContext);

/**
 * The add-member sheet is owned by `MembersTable` (it needs to refresh the table when
 * members were added), so these actions are intentionally inert.
 */
export function MemberActionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MemberActionsContext.Provider
      value={{
        openMemberAdd: () => undefined,
        openMemberEdit: () => undefined,
      }}
    >
      {children}
    </MemberActionsContext.Provider>
  );
}
