import React from 'react';
import { People } from '@mui/icons-material';
import StyledLayout from './styledLayout';
import { useAppSelector } from '../../../redux/store';

const AuthenticationLayout: React.FC = ({ children }) => {
  const configActive = useAppSelector((state) => state.authenticationSlice.data.config.active);
  const pathNames = [
    '/authentication/users',
    '/authentication/signIn',
    '/authentication/serviceAccounts',
    '/authentication/config',
    '/authentication/logs',
  ];
  const labels = [
    { name: 'users', id: 'users' },
    { name: 'sign in methods', id: 'signIn' },
    { name: 'service Accounts', id: 'serviceAccounts' },
    { name: 'config', id: 'config' },
    { name: 'logs', id: 'logs' },
  ];

  return (
    <StyledLayout
      configActive={configActive}
      title={'Authentication'}
      labels={labels}
      pathNames={pathNames}
      swagger={'authentication'}
      icon={<People />}>
      {children}
    </StyledLayout>
  );
};

export default AuthenticationLayout;
