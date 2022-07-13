import React, { ReactElement } from 'react';
import EmailsLayout from '../../components/navigation/InnerLayouts/emailsLayout';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const SendEmailForm = dynamic(() => import('../../components/emails/SendEmailForm'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Send = () => {
  return <SendEmailForm />;
};

Send.getLayout = function getLayout(page: ReactElement) {
  return <EmailsLayout>{page}</EmailsLayout>;
};

export default Send;
