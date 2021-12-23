import React from 'react';
import SharedLayout from './sharedLayout';
import { People } from '@material-ui/icons';

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
    <SharedLayout
      title={'Authentication'}
      labels={labels}
      pathNames={pathNames}
      swagger={'cms'}
      icon={<People />}>
      {children}
    </SharedLayout>
  );
};

export default AuthenticationLayout;
