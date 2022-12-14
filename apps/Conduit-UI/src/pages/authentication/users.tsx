import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import AuthenticationLayout from '../../features/authentication/authenticationLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const AuthenticationUsers = dynamic(
  () => import('../../features/authentication/components/AuthenticationUsers'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Users = () => {
  return <AuthenticationUsers />;
};

Users.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default Users;
