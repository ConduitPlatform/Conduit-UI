import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import { asyncGetSchemas } from '../../features/database/store/databaseSlice';
import DatabaseLayout from '../../features/database/databaseLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const CustomEndpointsLayout = dynamic(
  () => import('../../features/database/components/custom-endpoints/CustomEndpointsLayout'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Custom = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetSchemas({ skip: 0, limit: 200 }));
  }, [dispatch]);

  return <CustomEndpointsLayout />;
};

Custom.getLayout = function getLayout(page: ReactElement) {
  return <DatabaseLayout>{page}</DatabaseLayout>;
};

export default Custom;
