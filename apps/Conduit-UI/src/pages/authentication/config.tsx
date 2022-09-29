import React, { ReactElement, useEffect } from 'react';
import { asyncGetAuthenticationConfig } from '../../redux/slices/authenticationSlice';
import { useAppDispatch } from '../../redux/store';
import AuthenticationLayout from '../../components/navigation/InnerLayouts/authenticationLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const AuthenticationConfig = dynamic(
  () => import('../../components/authentication/AuthenticationConfig'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Config = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetAuthenticationConfig());
  }, [dispatch]);

  return <AuthenticationConfig />;
};

Config.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default Config;
