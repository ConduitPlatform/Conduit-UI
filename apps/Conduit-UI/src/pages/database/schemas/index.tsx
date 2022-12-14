import React, { ReactElement } from 'react';
import DatabaseLayout from '../../../features/database/databaseLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../../components/common/LoaderComponent';

const Schemas = dynamic(() => import('../../../features/database/components/schemas/Schemas'), {
  loading: () => <LoaderComponent />,
});

const SchemasPage = () => {
  return <Schemas />;
};

SchemasPage.getLayout = function getLayout(page: ReactElement) {
  return <DatabaseLayout>{page}</DatabaseLayout>;
};

export default SchemasPage;
