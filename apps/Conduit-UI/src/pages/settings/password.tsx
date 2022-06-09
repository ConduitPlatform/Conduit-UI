import React, { ReactElement } from 'react';
import SettingsLayout from '../../components/navigation/InnerLayouts/settingsLayout';
import ChangePasswordTab from '../../components/settings/ChangePasswordTab';

const Password = () => {
  return <ChangePasswordTab />;
};

Password.getLayout = function getLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default Password;
