import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import { asyncGetSecurityConfig } from '../../redux/slices/securitySlice';
import SecurityConfig from '../../components/security/SecurityConfig';
import SecurityLayout from '../../components/navigation/InnerLayouts/securityLayout';

const Config = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetSecurityConfig());
  }, [dispatch]);

  return <SecurityConfig />;
};

Config.getLayout = function getLayout(page: ReactElement) {
  return <SecurityLayout>{page}</SecurityLayout>;
};

export default Config;
