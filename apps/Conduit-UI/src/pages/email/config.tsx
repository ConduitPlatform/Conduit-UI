import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import EmailsLayout from '../../components/navigation/InnerLayouts/emailsLayout';
import { asyncGetEmailConfig } from '../../redux/slices/emailsSlice';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const EmailConfig = dynamic(() => import('../../components/emails/EmailConfig'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Config = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetEmailConfig());
  }, [dispatch]);

  return <EmailConfig />;
};

Config.getLayout = function getLayout(page: ReactElement) {
  return <EmailsLayout>{page}</EmailsLayout>;
};

export default Config;
