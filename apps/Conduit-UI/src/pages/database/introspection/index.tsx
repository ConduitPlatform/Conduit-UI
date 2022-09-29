import React, { ReactElement } from 'react';
import DatabaseLayout from '../../../components/navigation/InnerLayouts/databaseLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../../components/common/LoaderComponent';

const IntrospectionLayout = dynamic(
  () => import('../../../components/database/schemas/Introspection/IntrospectionLayout'),
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
