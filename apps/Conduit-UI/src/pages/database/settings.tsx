import React, { ReactElement } from 'react';
import DatabaseLayout from '../../components/navigation/InnerLayouts/databaseLayout';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const DatabaseSettings = dynamic(() => import('../../components/database/DatabaseSettings'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Settings = () => {
  return <DatabaseSettings />;
};

Settings.getLayout = function getLayout(page: ReactElement) {
  return <DatabaseLayout>{page}</DatabaseLayout>;
};

export default Settings;
