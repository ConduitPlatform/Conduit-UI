import React, { ReactElement } from 'react';
import Schemas from '../../../components/database/schemas/Schemas';
import DatabaseLayout from '../../../components/navigation/InnerLayouts/databaseLayout';

const SchemasPage = () => {
  return <Schemas />;
};

SchemasPage.getLayout = function getLayout(page: ReactElement) {
  return <DatabaseLayout>{page}</DatabaseLayout>;
};

export default SchemasPage;
