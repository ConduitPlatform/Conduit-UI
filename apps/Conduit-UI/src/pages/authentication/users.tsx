import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';
import AuthenticationLayout from '../../components/navigation/InnerLayouts/authenticationLayout';

const AuthenticationUsers = dynamic(
  () => import('../../components/authentication/AuthenticationUsers'),
  {
    loading: () => (
      <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
    ),
  }
);

const Users = () => {
  return <AuthenticationUsers />;
};

Users.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default Users;
