import React from 'react';
import { AuthTeam, AuthTeamUI } from './AuthModels';
import { DataTable } from '@conduitplatform/ui-components';

interface Props {
  sort: any;
  setSort: any;
  teams: AuthTeam[];
  handleAction: (action: { title: string; type: string }, data: AuthTeamUI) => void;
}

const AuthTeams: React.FC<Props> = ({ sort, setSort, teams, handleAction }) => {
  const formatData = (teams: AuthTeam[]): AuthTeamUI[] => {
    return teams.map((t) => {
      return {
        _id: t._id,
        Name: t.name,
        Default: t.isDefault,
        'Registered At': t.createdAt,
      };
    });
  };

  const toDelete = {
    title: 'Delete',
    type: 'delete',
  };

  const toEdit = {
    title: 'Edit',
    type: 'edit',
  };

  const actions = [toEdit, toDelete];

  const headers = [
    { title: '_id', sort: '_id' },
    { title: 'Name', sort: 'name' },
    { title: 'Default', sort: 'isDefault' },
    { title: 'Registered At', sort: 'createdAt' },
  ];

  return (
    <DataTable
      sort={sort}
      headers={headers}
      setSort={setSort}
      dsData={formatData(teams)}
      actions={actions}
      handleAction={handleAction}
      selectable={false}
    />
  );
};

export default AuthTeams;
