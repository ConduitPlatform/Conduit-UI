import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';
import StorageLayout from '../../components/navigation/InnerLayouts/storageLayout';

const StorageLogs = dynamic(() => import('../../components/logs/LogsComponent'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Logs = () => {
  return <StorageLogs moduleName={'storage'} />;
};

Logs.getLayout = function getLayout(page: ReactElement) {
  return <StorageLayout>{page}</StorageLayout>;
};

export default Logs;
