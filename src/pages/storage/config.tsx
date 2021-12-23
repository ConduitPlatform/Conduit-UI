import React, { ReactElement, useEffect } from 'react';
import StorageLayout from '../../components/navigation/InnerLayouts/storageLayout';
import StorageConfig from '../../components/storage/StorageConfig';

import { asyncGetStorageConfig } from '../../redux/slices/storageSlice';
import { useAppDispatch } from '../../redux/store';

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
