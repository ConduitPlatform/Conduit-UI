import React, { ReactElement, useEffect } from 'react';
import RouterLayout from '../../components/navigation/InnerLayouts/routerLayout';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { asyncGetRouterConfig } from '../../redux/slices/routerSlice';
import { useAppDispatch } from '../../redux/store';

const SecurityTab = dynamic(() => import('../../components/routing/SecurityTab'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const SecurityClients = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetRouterConfig());
  }, [dispatch]);

  return <SecurityTab />;
};

SecurityClients.getLayout = function getLayout(page: ReactElement) {
  return <RouterLayout>{page}</RouterLayout>;
};

export default SecurityClients;
