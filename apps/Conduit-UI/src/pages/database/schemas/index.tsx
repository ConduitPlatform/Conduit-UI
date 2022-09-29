import React, { ReactElement } from 'react';
import DatabaseLayout from '../../../components/navigation/InnerLayouts/databaseLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../../components/common/LoaderComponent';

const Schemas = dynamic(() => import('../../../components/database/schemas/Schemas'), {
  loading: () => <LoaderComponent />,
});

const SchemasPage = () => {
  return <Schemas />;
};

SchemasPage.getLayout = function getLayout(page: ReactElement) {
  return <DatabaseLayout>{page}</DatabaseLayout>;
};

export default SchemasPage;
