import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import { asyncGetSchemas } from '../../redux/slices/databaseSlice';
import DatabaseLayout from '../../components/navigation/InnerLayouts/databaseLayout';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const CustomEndpointsLayout = dynamic(
  () => import('../../components/database/custom-endpoints/CustomEndpointsLayout'),
  {
    loading: () => (
      <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
    ),
  }
);

const Custom = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetSchemas({ skip: 0, limit: 50, enabled: true }));
  }, [dispatch]);

  return <CustomEndpointsLayout />;
};

Custom.getLayout = function getLayout(page: ReactElement) {
  return <DatabaseLayout>{page}</DatabaseLayout>;
};

export default Custom;
