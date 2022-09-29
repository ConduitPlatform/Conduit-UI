import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import RouterLayout from '../../components/navigation/InnerLayouts/routerLayout';
import { asyncGetRouterConfig } from '../../redux/slices/routerSlice';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const RouterSettings = dynamic(() => import('../../components/routing/routerSettings'), {
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
