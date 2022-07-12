import React, { ReactElement } from 'react';
import AuthenticationLayout from '../../components/navigation/InnerLayouts/authenticationLayout';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const AuthenticationSignIn = dynamic(
  () => import('../../components/authentication/AuthenticationSignIn'),
  {
    loading: () => (
      <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
    ),
  }
);

const SignIn = () => {
  return <AuthenticationSignIn />;
};

SignIn.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default SignIn;
