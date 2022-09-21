import React, { ReactElement } from 'react';
import SettingsLayout from '../../components/navigation/InnerLayouts/settingsLayout';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const UserSettingsTab = dynamic(() => import('../../components/settings/UserSettingsLayout'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const UserSettings = () => {
  return <UserSettingsTab />;
};

UserSettings.getLayout = function getLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default UserSettings;
