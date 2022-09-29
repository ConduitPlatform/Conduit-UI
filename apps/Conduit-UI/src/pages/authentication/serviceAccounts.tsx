import AuthenticationLayout from '../../components/navigation/InnerLayouts/authenticationLayout';
import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const ServiceAccountsTabs = dynamic(
  () => import('../../components/authentication/ServiceAccountsTabs'),
  {
    loading: () => <LoaderComponent />,
  }
);

const ServiceAccounts = () => {
  return <ServiceAccountsTabs />;
};

ServiceAccounts.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default ServiceAccounts;
