import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import RouterLayout from '../../features/router/routerLayout';
import { asyncGetRouterConfig } from '../../features/router/routerSlice';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const RouterSettings = dynamic(() => import('../../features/router/routerSettings'), {
  loading: () => <LoaderComponent />,
});

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
