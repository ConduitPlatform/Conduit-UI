import React, { ReactElement } from 'react';
import EmailsLayout from '../../components/navigation/InnerLayouts/emailsLayout';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const EmailTemplates = dynamic(() => import('../../components/emails/EmailTemplates'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Templates = () => {
  return <EmailTemplates />;
};

Templates.getLayout = function getLayout(page: ReactElement) {
  return <EmailsLayout>{page}</EmailsLayout>;
};

export default Templates;
