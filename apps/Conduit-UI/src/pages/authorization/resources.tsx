import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';
import AuthorizationLayout from '../../features/authorization/authorizationLayout';

const AuthorizationTemplates = dynamic(
  () => import('../../features/authorization/components/AuthzResources'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Resources = () => {
  return <AuthorizationTemplates />;
};

Resources.getLayout = function getLayout(page: ReactElement) {
  return <AuthorizationLayout>{page}</AuthorizationLayout>;
};

export default Resources;
