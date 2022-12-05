import React, { ReactElement } from 'react';
import DatabaseLayout from '../../../features/database/databaseLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../../components/common/LoaderComponent';

const IntrospectionLayout = dynamic(
  () => import('../../../features/database/components/schemas/Introspection/IntrospectionLayout'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Introspection = () => {
  return <IntrospectionLayout />;
};

Introspection.getLayout = function getLayout(page: ReactElement) {
  return <DatabaseLayout>{page}</DatabaseLayout>;
};

export default Introspection;
