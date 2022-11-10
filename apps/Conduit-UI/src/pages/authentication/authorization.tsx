import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import AuthenticationLayout from '../../components/navigation/InnerLayouts/authenticationLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const AuthorizationDashbard = dynamic(
  () => import('../../components/authentication/authorization/AuthorizationDashboard'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Authorization = () => {
  return <AuthorizationDashbard />;
};

Authorization.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default Authorization;
