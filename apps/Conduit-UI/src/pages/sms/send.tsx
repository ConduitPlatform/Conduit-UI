import React, { ReactElement } from 'react';
import SMSLayout from '../../features/sms/smsLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const SendSms = dynamic(() => import('../../features/sms/SendSms'), {
  loading: () => <LoaderComponent />,
});

const Send = () => {
  return <SendSms />;
};

Send.getLayout = function getLayout(page: ReactElement) {
  return <SMSLayout>{page}</SMSLayout>;
};

export default Send;
