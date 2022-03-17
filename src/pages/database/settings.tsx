import React, { ReactElement } from 'react';
import DatabaseLayout from '../../components/navigation/InnerLayouts/databaseLayout';

const Settings = () => {
  return <div>Under construction...</div>;
};

Settings.getLayout = function getLayout(page: ReactElement) {
  return <DatabaseLayout>{page}</DatabaseLayout>;
};

export default Settings;
