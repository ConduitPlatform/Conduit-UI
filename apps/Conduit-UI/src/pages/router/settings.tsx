import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import RouterLayout from '../../components/navigation/InnerLayouts/routerLayout';
import { asyncGetRouterConfig } from '../../redux/slices/routerSlice';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const RouterSettings = dynamic(() => import('../../components/routing/routerSettings'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
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
