import React, { ReactElement, useEffect } from 'react';
import { asyncGetAuthenticationConfig } from '../../features/authentication/store/authenticationSlice';
import { useAppDispatch } from '../../redux/store';
import AuthenticationLayout from '../../features/authentication/authenticationLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const AuthenticationConfig = dynamic(
  () => import('../../features/authentication/components/AuthenticationConfig'),
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
