import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';
import StorageLayout from '../../components/navigation/InnerLayouts/storageLayout';

const StorageDashboard = dynamic(() => import('../../components/storage/StorageDashboard'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Dashboard = () => {
  return <StorageDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <StorageLayout>{page}</StorageLayout>;
};

export default Dashboard;
