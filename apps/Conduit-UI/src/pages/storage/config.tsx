import React, { ReactElement, useEffect } from 'react';
import StorageLayout from '../../components/navigation/InnerLayouts/storageLayout';
import { asyncGetStorageConfig } from '../../redux/slices/storageSlice';
import { useAppDispatch } from '../../redux/store';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const StorageConfig = dynamic(() => import('../../components/storage/StorageConfig'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Config = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetStorageConfig());
  }, [dispatch]);

  return <StorageConfig />;
};

Config.getLayout = function getLayout(page: ReactElement) {
  return <StorageLayout>{page}</StorageLayout>;
};

export default Config;
