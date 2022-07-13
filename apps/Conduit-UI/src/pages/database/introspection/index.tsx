import React, { ReactElement } from 'react';
import DatabaseLayout from '../../../components/navigation/InnerLayouts/databaseLayout';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const IntrospectionLayout = dynamic(
  () => import('../../../components/database/schemas/Introspection/IntrospectionLayout'),
  {
    loading: () => (
      <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
    ),
  }
);

const Introspection = () => {
  return <IntrospectionLayout />;
};

Introspection.getLayout = function getLayout(page: ReactElement) {
  return <DatabaseLayout>{page}</DatabaseLayout>;
};

export default Introspection;
