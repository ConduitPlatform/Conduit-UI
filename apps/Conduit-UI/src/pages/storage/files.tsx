import React, { ReactElement } from 'react';
import StorageLayout from '../../components/navigation/InnerLayouts/storageLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const StorageFiles = dynamic(() => import('../../components/storage/StorageFiles'), {
  loading: () => <LoaderComponent />,
});

const Files = () => {
  return <StorageFiles />;
};

Files.getLayout = function getLayout(page: ReactElement) {
  return <StorageLayout>{page}</StorageLayout>;
};

export default Files;
