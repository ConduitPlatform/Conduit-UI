import AuthenticationLayout from '../../components/navigation/InnerLayouts/authenticationLayout';
import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const ServiceAccountsTabs = dynamic(
  () => import('../../components/authentication/ServiceAccountsTabs'),
  {
    loading: () => (
      <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
    ),
  }
);

const ServiceAccounts = () => {
  return <ServiceAccountsTabs />;
};

ServiceAccounts.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default ServiceAccounts;
