import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import EmailsLayout from '../../components/navigation/InnerLayouts/emailsLayout';
import { asyncGetEmailConfig } from '../../redux/slices/emailsSlice';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const EmailConfig = dynamic(() => import('../../components/emails/EmailConfig'), {
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
