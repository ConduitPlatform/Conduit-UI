import React, { ReactElement } from 'react';
import SMSLayout from '../../components/navigation/InnerLayouts/smsLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const SendSms = dynamic(() => import('../../components/sms/SendSms'), {
  loading: () => <LoaderComponent />,
});

const Send = () => {
  return <SendSms />;
};

Send.getLayout = function getLayout(page: ReactElement) {
  return <SMSLayout>{page}</SMSLayout>;
};

export default Send;
