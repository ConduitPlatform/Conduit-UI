import React, { ReactElement, useEffect } from 'react';
import { asyncGetAuthenticationConfig } from '../../redux/slices/authenticationSlice';
import { useAppDispatch } from '../../redux/store';
import AuthenticationLayout from '../../components/navigation/InnerLayouts/authenticationLayout';
import ScaleLoader from 'react-spinners/ScaleLoader';
import dynamic from 'next/dynamic';

const AuthenticationConfig = dynamic(
  () => import('../../components/authentication/AuthenticationConfig'),
  {
    loading: () => (
      <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
    ),
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
