import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import StorageLayout from '../../features/storage/storageLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const StorageDashboard = dynamic(
  () => import('../../features/storage/components/StorageDashboard'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Dashboard = () => {
  return <StorageDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <StorageLayout>{page}</StorageLayout>;
};

export default Dashboard;
