import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import StorageLayout from '../../components/navigation/InnerLayouts/storageLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const StorageDashboard = dynamic(() => import('../../components/storage/StorageDashboard'), {
  loading: () => <LoaderComponent />,
});

const Dashboard = () => {
  return <StorageDashboard />;
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <StorageLayout>{page}</StorageLayout>;
};

export default Dashboard;
