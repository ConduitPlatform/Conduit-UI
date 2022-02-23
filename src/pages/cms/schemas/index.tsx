import React, { ReactElement } from 'react';
import CmsLayout from '../../../components/navigation/InnerLayouts/cmsLayout';
import Schemas from '../../../components/cms/schema-data/Schemas';

const SchemasPage = () => {
  return <Schemas />;
};

SchemasPage.getLayout = function getLayout(page: ReactElement) {
  return <CmsLayout>{page}</CmsLayout>;
};

export default SchemasPage;
