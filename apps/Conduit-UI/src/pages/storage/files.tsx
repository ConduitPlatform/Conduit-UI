import React, { ReactElement } from 'react';
import StorageLayout from '../../components/navigation/InnerLayouts/storageLayout';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const StorageFiles = dynamic(() => import('../../components/storage/StorageFiles'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Files = () => {
  return <StorageFiles />;
};

Files.getLayout = function getLayout(page: ReactElement) {
  return <StorageLayout>{page}</StorageLayout>;
};

export default Files;
