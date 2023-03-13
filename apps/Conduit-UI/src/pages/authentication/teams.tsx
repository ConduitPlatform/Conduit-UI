import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import AuthenticationLayout from '../../features/authentication/authenticationLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const AuthenticationTeams = dynamic(
  () => import('../../features/authentication/components/AuthenticationTeams'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Teams = () => {
  return <AuthenticationTeams />;
};

Teams.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default Teams;
