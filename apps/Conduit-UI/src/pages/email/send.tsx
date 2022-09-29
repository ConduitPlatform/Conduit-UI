import React, { ReactElement } from 'react';
import EmailsLayout from '../../components/navigation/InnerLayouts/emailsLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const SendEmailForm = dynamic(() => import('../../components/emails/SendEmailForm'), {
  loading: () => <LoaderComponent />,
});

const Send = () => {
  return <SendEmailForm />;
};

Send.getLayout = function getLayout(page: ReactElement) {
  return <EmailsLayout>{page}</EmailsLayout>;
};

export default Send;
