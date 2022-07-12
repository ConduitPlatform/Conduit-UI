import React, { ReactElement } from 'react';
import SMSLayout from '../../components/navigation/InnerLayouts/smsLayout';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const SendSms = dynamic(() => import('../../components/sms/SendSms'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Send = () => {
  return <SendSms />;
};

Send.getLayout = function getLayout(page: ReactElement) {
  return <SMSLayout>{page}</SMSLayout>;
};

export default Send;
