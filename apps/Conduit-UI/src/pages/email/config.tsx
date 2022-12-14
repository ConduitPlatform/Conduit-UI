import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import EmailsLayout from '../../features/emails/emailsLayout';
import { asyncGetEmailConfig } from '../../features/emails/store/emailsSlice';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const EmailConfig = dynamic(() => import('../../features/emails/components/EmailConfig'), {
  loading: () => <LoaderComponent />,
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
