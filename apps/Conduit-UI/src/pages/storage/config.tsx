import React, { ReactElement, useEffect } from 'react';
import StorageLayout from '../../features/storage/storageLayout';
import { asyncGetStorageConfig } from '../../features/storage/store/storageSlice';
import { useAppDispatch } from '../../redux/store';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const StorageConfig = dynamic(() => import('../../features/storage/components/StorageConfig'), {
  loading: () => <LoaderComponent />,
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
