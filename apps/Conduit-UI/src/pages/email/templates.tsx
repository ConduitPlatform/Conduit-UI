import React, { ReactElement } from 'react';
import EmailsLayout from '../../features/emails/emailsLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const EmailTemplates = dynamic(() => import('../../features/emails/components/EmailTemplates'), {
  loading: () => <LoaderComponent />,
});

const Templates = () => {
  return <EmailTemplates />;
};

Templates.getLayout = function getLayout(page: ReactElement) {
  return <EmailsLayout>{page}</EmailsLayout>;
};

export default Templates;
