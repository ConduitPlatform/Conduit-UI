import React, { ReactElement } from 'react';
import RouterLayout from '../../components/navigation/InnerLayouts/routerLayout';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const SecurityTab = dynamic(() => import('../../components/routing/SecurityTab'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const SecurityClients = () => {
  return <SecurityTab />;
};

SecurityClients.getLayout = function getLayout(page: ReactElement) {
  return <RouterLayout>{page}</RouterLayout>;
};

export default SecurityClients;
