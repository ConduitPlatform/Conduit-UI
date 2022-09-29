import React, { ReactElement } from 'react';
import SettingsLayout from '../../components/navigation/InnerLayouts/settingsLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const SettingsAdmins = dynamic(() => import('../../components/settings/SettingsAdmins'), {
  loading: () => <LoaderComponent />,
});

const Admins = () => {
  return <SettingsAdmins />;
};
Admins.getLayout = function getLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default Admins;
