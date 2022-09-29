import React, { ReactElement, useEffect } from 'react';
import RouterLayout from '../../components/navigation/InnerLayouts/routerLayout';
import dynamic from 'next/dynamic';
import { asyncGetRouterConfig } from '../../redux/slices/routerSlice';
import { useAppDispatch } from '../../redux/store';
import LoaderComponent from '../../components/common/LoaderComponent';

const SecurityTab = dynamic(() => import('../../components/routing/SecurityTab'), {
  loading: () => <LoaderComponent />,
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
