import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import AuthenticationLayout from '../../components/navigation/InnerLayouts/authenticationLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const AuthenticationUsers = dynamic(
  () => import('../../components/authentication/AuthenticationUsers'),
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
