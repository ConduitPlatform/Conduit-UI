import React, { ReactElement } from 'react';
import EmailsLayout from '../../features/emails/emailsLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const SendEmailForm = dynamic(() => import('../../features/emails/SendEmailForm'), {
  loading: () => <LoaderComponent />,
});

const Send = () => {
  return <SendEmailForm />;
};

Send.getLayout = function getLayout(page: ReactElement) {
  return <EmailsLayout>{page}</EmailsLayout>;
};

export default Send;
