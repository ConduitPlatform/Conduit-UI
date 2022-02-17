import React, { ReactElement } from 'react';

import CmsLayout from '../../components/navigation/InnerLayouts/cmsLayout';

import SchemaData from '../../components/cms/schema-data/SchemaData';

const SchemaDataPage = () => {
  return <SchemaData />;
};

SchemaDataPage.getLayout = function getLayout(page: ReactElement) {
  return <CmsLayout>{page}</CmsLayout>;
};

export default SchemaDataPage;
