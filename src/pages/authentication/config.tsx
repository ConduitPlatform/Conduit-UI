import React, { ReactElement, useEffect } from 'react';
import { asyncGetAuthenticationConfig } from '../../redux/slices/authenticationSlice';
import { useAppDispatch } from '../../redux/store';
import AuthenticationLayout from '../../components/navigation/InnerLayouts/authenticationLayout';
import AuthConfig from '../../components/authentication/AuthConfig';

const Config = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetAuthenticationConfig());
  }, [dispatch]);

  return <AuthConfig />;
};

Config.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default Config;
