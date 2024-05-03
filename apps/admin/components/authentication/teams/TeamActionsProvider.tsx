'use client';
import * as React from 'react';
import { useContext } from 'react';
import { AddTeamSheet } from '@/components/authentication/teams/addTeamSheet/addTeamSheet';

type TeamActionsProvider = {
  openTeamAdd: () => void
  openTeamEdit: (userId: string) => void
}

const initialState: TeamActionsProvider = {
  openTeamAdd: () => {
    throw new Error('Not implemented');
  },
  openTeamEdit: (userId: string) => {
    throw new Error('Not implemented');
  },
};

const TeamActionsContext = React.createContext(initialState);
export const useTeamActions = () => useContext(TeamActionsContext);

export function TeamActionsProvider({ children }: { children: React.ReactNode }) {
  const [teamAdd, setTeamAdd] = React.useState<boolean>(false);
  const [teamEdit, setTeamEdit] = React.useState<string | undefined>(undefined);
  const openTeamAdd = () => {
    setTeamAdd(true);
  };
  const openTeamEdit = (userId: string) => {
    setTeamEdit(userId);
  };

  return <TeamActionsContext.Provider
    value={{
      openTeamAdd,
      openTeamEdit,
    }}
  >
    <AddTeamSheet defaultOpen={teamAdd} onClose={() => setTeamAdd(false)} />
    <AddTeamSheet defaultOpen={teamEdit !== undefined} />

    {children}
  </TeamActionsContext.Provider>;
}
