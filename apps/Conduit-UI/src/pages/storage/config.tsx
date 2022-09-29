import React, { ReactElement, useEffect } from 'react';
import StorageLayout from '../../components/navigation/InnerLayouts/storageLayout';
import { asyncGetStorageConfig } from '../../redux/slices/storageSlice';
import { useAppDispatch } from '../../redux/store';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const StorageConfig = dynamic(() => import('../../components/storage/StorageConfig'), {
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
