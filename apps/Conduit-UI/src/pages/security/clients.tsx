import React, { ReactElement } from 'react';
import SecurityLayout from '../../components/navigation/InnerLayouts/securityLayout';
import ClientsTab from '../../components/security/ClientsTab';

const SecurityClients = () => {
  return <ClientsTab />;
};

SecurityClients.getLayout = function getLayout(page: ReactElement) {
  return <SecurityLayout>{page}</SecurityLayout>;
};

export default SecurityClients;
