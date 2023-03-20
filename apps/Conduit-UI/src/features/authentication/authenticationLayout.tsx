import React from 'react';
import { People } from '@mui/icons-material';
import StyledLayout from '../../components/navigation/InnerLayouts/styledLayout';
import { useAppSelector } from '../../redux/store';

const AuthenticationLayout: React.FC = ({ children }) => {
  const configActive = useAppSelector((state) => state.authenticationSlice.data.config.active);
  const pathNames = [
    '/authentication/dashboard',
    '/authentication/users',
    '/authentication/teams',
    '/authentication/signIn',
    '/authentication/serviceAccounts',
    '/authentication/config',
  ];
  const labels = [
    { name: 'Dashboard', id: 'dashboard' },
    { name: 'Users', id: 'users' },
    { name: 'Teams', id: 'teams' },
    { name: 'Sign-in Methods', id: 'signIn' },
    { name: 'Service Accounts', id: 'serviceAccounts' },
    { name: 'Config', id: 'config' },
  ];

  return (
    <StyledLayout
      configActive={configActive}
      module={'authentication'}
      docs="https://getconduit.dev/docs/modules/authentication/config#available-options"
      labels={labels}
      pathNames={pathNames}
      swagger={'authentication'}
      icon={<People />}>
      {children}
    </StyledLayout>
  );
};

export default AuthenticationLayout;
