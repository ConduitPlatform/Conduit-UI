import React, { ReactElement } from 'react';
import ClientsTable from '../../components/routing/ClientsTable';
import RouterLayout from '../../components/navigation/InnerLayouts/routerLayout';

const SecurityClients = () => {
  return <ClientsTable />;
};

SecurityClients.getLayout = function getLayout(page: ReactElement) {
  return <RouterLayout>{page}</RouterLayout>;
};

export default SecurityClients;
