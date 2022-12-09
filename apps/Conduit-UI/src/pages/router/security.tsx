import React, { ReactElement, useEffect } from 'react';
import RouterLayout from '../../features/router/routerLayout';
import dynamic from 'next/dynamic';
import { asyncGetRouterConfig } from '../../features/router/store/routerSlice';
import { useAppDispatch } from '../../redux/store';
import LoaderComponent from '../../components/common/LoaderComponent';

const SecurityTab = dynamic(() => import('../../features/router/components/SecurityTab'), {
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
