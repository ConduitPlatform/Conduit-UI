import React, { ReactElement } from 'react';
import EmailsLayout from '../../components/navigation/InnerLayouts/emailsLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const EmailTemplates = dynamic(() => import('../../components/emails/EmailTemplates'), {
  loading: () => <LoaderComponent />,
});

const Templates = () => {
  return <EmailTemplates />;
};

Templates.getLayout = function getLayout(page: ReactElement) {
  return <EmailsLayout>{page}</EmailsLayout>;
};

export default Templates;
