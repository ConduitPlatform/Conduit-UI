import React, { ReactElement } from 'react';
import SecurityTab from '../../components/routing/SecurityTab';
import RouterLayout from '../../components/navigation/InnerLayouts/routerLayout';

const SecurityClients = () => {
  return <SecurityTab />;
};

SecurityClients.getLayout = function getLayout(page: ReactElement) {
  return <RouterLayout>{page}</RouterLayout>;
};

export default SecurityClients;
