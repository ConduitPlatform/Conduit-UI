import React from 'react';
import { People } from '@mui/icons-material';
import StyledLayout from '../../components/navigation/InnerLayouts/styledLayout';
import { useAppSelector } from '../../redux/store';

const AuthenticationLayout: React.FC = ({ children }) => {
  const configActive = useAppSelector((state) => state.authenticationSlice.data.config.active);
  const pathNames = [
    '/authentication/dashboard',
    '/authentication/users',
    '/authentication/signIn',
    '/authentication/serviceAccounts',
    '/authentication/config',
  ];
  const labels = [
    { name: 'dashboard', id: 'dashboard' },
    { name: 'users', id: 'users' },
    { name: 'sign in methods', id: 'signIn' },
    { name: 'service Accounts', id: 'serviceAccounts' },
    { name: 'config', id: 'config' },
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
