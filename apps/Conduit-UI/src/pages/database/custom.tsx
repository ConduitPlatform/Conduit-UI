import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import { asyncGetSchemas } from '../../redux/slices/databaseSlice';
import DatabaseLayout from '../../components/navigation/InnerLayouts/databaseLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const CustomEndpointsLayout = dynamic(
  () => import('../../components/database/custom-endpoints/CustomEndpointsLayout'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Custom = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetSchemas({ skip: 0, limit: 100, owner: ['database'] }));
  }, [dispatch]);

  return <CustomEndpointsLayout />;
};

Custom.getLayout = function getLayout(page: ReactElement) {
  return <DatabaseLayout>{page}</DatabaseLayout>;
};

export default Custom;
