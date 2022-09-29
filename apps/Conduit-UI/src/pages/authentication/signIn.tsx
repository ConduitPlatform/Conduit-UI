import React, { ReactElement } from 'react';
import AuthenticationLayout from '../../components/navigation/InnerLayouts/authenticationLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const AuthenticationSignIn = dynamic(
  () => import('../../components/authentication/AuthenticationSignIn'),
  {
    loading: () => <LoaderComponent />,
  }
);

const SignIn = () => {
  return <AuthenticationSignIn />;
};

SignIn.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default SignIn;
