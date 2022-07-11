import React, { ReactElement, useEffect } from 'react';
import SettingsLayout from '../../components/navigation/InnerLayouts/settingsLayout';
import GeneralSettingsTab from '../../components/settings/GeneralSettingsTab';
import { asyncGetAdminSettings, asyncGetCoreSettings } from '../../redux/slices/settingsSlice';
import { useAppDispatch } from '../../redux/store';

const CoreSettings = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetCoreSettings());
    dispatch(asyncGetAdminSettings());
  }, [dispatch]);

  return <GeneralSettingsTab />;
};

CoreSettings.getLayout = function getLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default CoreSettings;
