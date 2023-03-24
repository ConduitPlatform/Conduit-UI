import React from 'react';
import { AuthUser, AuthUserUI } from './AuthModels';
import { DataTable } from '@conduitplatform/ui-components';

interface Props {
  sort: any;
  setSort: any;
  users: AuthUser[];
  handleAction: (action: { title: string; type: string }, data: AuthUserUI) => void;
  handleSelect: (id: string) => void;
  handleSelectAll: (data: AuthUserUI[]) => void;
  selectedUsers: string[];
  actions?: ('delete' | 'edit' | 'block')[];
}

const AuthUsers: React.FC<Props> = ({
  sort,
  setSort,
  users,
  handleAction,
  handleSelect,
  handleSelectAll,
  selectedUsers,
  actions = ['edit', 'delete', 'block'],
}) => {
  const formatData = (users: AuthUser[]) => {
    return users.map((u) => {
      return {
        _id: u._id,
        Email: u.email ? u.email : 'N/A',
        Active: u.active,
        Verified: u.isVerified,
        'Registered At': u.createdAt,
      };
    });
  };

  const tableActions = actions.map((action) => {
    switch (action) {
      case 'edit':
        return {
          title: 'Edit',
          type: 'edit',
        };
      case 'delete':
        return {
          title: 'Delete',
          type: 'delete',
        };
      case 'block':
        return {
          title: 'Block/Unblock',
          type: 'block/unblock',
        };
    }
  });

  const headers = [
    { title: '_id', sort: '_id' },
    { title: 'Email', sort: 'email' },
    { title: 'Active', sort: 'active' },
    { title: 'Verified', sort: 'isVerified' },
    { title: 'Registered At', sort: 'createdAt' },
  ];

  return (
    <DataTable
      sort={sort}
      headers={headers}
      setSort={setSort}
      dsData={formatData(users)}
      actions={tableActions}
      handleAction={handleAction}
      handleSelect={handleSelect}
      handleSelectAll={handleSelectAll}
      selectedItems={selectedUsers}
    />
  );
};

export default AuthUsers;
