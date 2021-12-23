import React, { ReactElement, useEffect } from 'react';
import { asyncGetAuthenticationConfig } from '../../redux/slices/authenticationSlice';
import { useAppDispatch } from '../../redux/store';
import AuthenticationLayout from '../../components/navigation/InnerLayouts/authenticationLayout';
import AuthenticationConfig from '../../components/authentication/AuthenticationConfig';

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
