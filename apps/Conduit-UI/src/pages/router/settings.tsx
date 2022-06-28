import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import RouterLayout from '../../components/navigation/InnerLayouts/routerLayout';
import RoutingSettings from '../../components/routing/RoutingSettings';
import { asyncGetSecurityConfig } from '../../redux/slices/securitySlice';

const CoreSettings = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetSecurityConfig());
  }, [dispatch]);

  return <RoutingSettings />;
};

CoreSettings.getLayout = function getLayout(page: ReactElement) {
  return <RouterLayout>{page}</RouterLayout>;
};

export default CoreSettings;
