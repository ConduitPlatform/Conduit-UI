'use client';
import * as React from 'react';
import { useContext } from 'react';
import { AddTeamSheet } from '@/components/authentication/teams/addTeamSheet/addTeamSheet';

type TeamActionsProvider = {
  openTeamAdd: () => void;
  openSubTeamAdd: (parentId: string) => void;
};

const initialState: TeamActionsProvider = {
  openTeamAdd: () => {
    throw new Error('Not implemented');
  },
  openSubTeamAdd: (parentId: string) => {
    throw new Error('Not implemented');
  },
};

const TeamActionsContext = React.createContext(initialState);
export const useTeamActions = () => useContext(TeamActionsContext);

export function TeamActionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [teamAdd, setTeamAdd] = React.useState<boolean>(false);
  const [subTeamAdd, setSubTeamAdd] = React.useState<string | undefined>(
    undefined
  );
  const openTeamAdd = () => {
    setTeamAdd(true);
  };
  const openSubTeamAdd = (parentTeam: string) => {
    setSubTeamAdd(parentTeam);
  };

  return (
    <TeamActionsContext.Provider
      value={{
        openTeamAdd,
        openSubTeamAdd,
      }}
    >
      <div className="container py-10">
        <AddTeamSheet
          defaultOpen={teamAdd}
          onClose={() => setTeamAdd(false)}
          parent={subTeamAdd}
        />
        {children}
      </div>
    </TeamActionsContext.Provider>
  );
}
