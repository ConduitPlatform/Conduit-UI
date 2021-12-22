import React, { ReactElement, useEffect } from 'react';
import StorageLayout from '../../components/navigation/InnerLayouts/storageLayout';
import StorageConfig from '../../components/storage/StorageConfig';

import { asyncGetStorageConfig } from '../../redux/slices/storageSlice';
import { useAppDispatch } from '../../redux/store';

const Files = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetStorageConfig());
  }, [dispatch]);

  return <StorageConfig />;
};

Files.getLayout = function getLayout(page: ReactElement) {
  return <StorageLayout>{page}</StorageLayout>;
};

export default Files;
