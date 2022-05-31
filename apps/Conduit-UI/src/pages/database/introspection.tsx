import React, { ReactElement } from 'react';
import DatabaseLayout from '../../components/navigation/InnerLayouts/databaseLayout';
import { Box } from '@mui/material';
import IntrospectionLayout from '../../components/database/schemas/Introspection/IntrospectionLayout';

const Introspection = () => {
  return <IntrospectionLayout />;
};

Introspection.getLayout = function getLayout(page: ReactElement) {
  return <DatabaseLayout>{page}</DatabaseLayout>;
};

export default Introspection;
