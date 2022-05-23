import React from 'react';
import { SharedLayout } from '@conduitplatform/ui-components';
import { People } from '@mui/icons-material';
import StyledLayout from './styledLayout';

const AuthenticationLayout: React.FC = ({ children }) => {
  const pathNames = [
    '/authentication/users',
    '/authentication/signIn',
    '/authentication/serviceAccounts',
    '/authentication/config',
  ];
  const labels = [
    { name: 'users', id: 'users' },
    { name: 'sign in methods', id: 'signIn' },
    { name: 'service Accounts', id: 'serviceAccounts' },
    { name: 'config', id: 'config' },
  ];

  return (
    <StyledLayout
      baseUrl={`${process.env.CONDUIT_URL}`}
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
