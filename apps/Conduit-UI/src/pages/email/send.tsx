import React, { ReactElement } from 'react';
import EmailsLayout from '../../components/navigation/InnerLayouts/emailsLayout';
import SendEmailForm from '../../components/emails/SendEmailForm';

const Send = () => {
  return <SendEmailForm />;
};

Send.getLayout = function getLayout(page: ReactElement) {
  return <EmailsLayout>{page}</EmailsLayout>;
};

export default Send;
