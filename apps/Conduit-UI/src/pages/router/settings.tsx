import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import RouterLayout from '../../components/navigation/InnerLayouts/routerLayout';
import RouterSettings from '../../components/routing/routerSettings';
import { asyncGetRouterConfig } from '../../redux/slices/routerSlice';

const Settings = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetRouterConfig());
  }, [dispatch]);

  return <RouterSettings />;
};

Settings.getLayout = function getLayout(page: ReactElement) {
  return <RouterLayout>{page}</RouterLayout>;
};

export default Settings;
