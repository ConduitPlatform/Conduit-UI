import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import RouterLayout from '../../features/router/routerLayout';
import { asyncGetRouterConfig } from '../../features/router/store/routerSlice';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const RouterRoutes = dynamic(() => import('../../features/router/components/routeGrid'), {
  loading: () => <LoaderComponent />,
});

const Routes = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetRouterConfig());
  }, [dispatch]);

  return <RouterRoutes />;
};

Routes.getLayout = function getLayout(page: ReactElement) {
  return <RouterLayout>{page}</RouterLayout>;
};

export default Routes;
