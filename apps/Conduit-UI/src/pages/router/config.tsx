import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import { asyncGetSecurityConfig } from '../../redux/slices/securitySlice';
import SecurityConfig from '../../components/routing/SecurityConfig';
import RouterLayout from '../../components/navigation/InnerLayouts/routerLayout';

const Config = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetSecurityConfig());
  }, [dispatch]);

  return <SecurityConfig />;
};

Config.getLayout = function getLayout(page: ReactElement) {
  return <RouterLayout>{page}</RouterLayout>;
};

export default Config;
