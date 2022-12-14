import React, { ReactElement } from 'react';
import SettingsLayout from '../../features/settings/settingsLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const SettingsAdmins = dynamic(() => import('../../features/settings/components/SettingsAdmins'), {
  loading: () => <LoaderComponent />,
});

const Admins = () => {
  return <SettingsAdmins />;
};
Admins.getLayout = function getLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default Admins;
