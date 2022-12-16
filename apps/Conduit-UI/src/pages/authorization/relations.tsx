import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';
import AuthorizationLayout from '../../features/authorization/authorizationLayout';

const EmailTemplates = dynamic(
  () => import('../../features/authorization/components/AuthzRelations'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Templates = () => {
  return <EmailTemplates />;
};

Templates.getLayout = function getLayout(page: ReactElement) {
  return <AuthorizationLayout>{page}</AuthorizationLayout>;
};

export default Templates;
