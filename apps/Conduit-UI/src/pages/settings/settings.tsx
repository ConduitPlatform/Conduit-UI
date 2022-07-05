import React, { ReactElement, useEffect } from 'react';
import SettingsLayout from '../../components/navigation/InnerLayouts/settingsLayout';
import CoreSettingsTab from '../../components/settings/CoreSettingsTab';
import { asyncGetAdminSettings, asyncGetCoreSettings } from '../../redux/slices/settingsSlice';
import { useAppDispatch } from '../../redux/store';

const CoreSettings = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetCoreSettings());
    dispatch(asyncGetAdminSettings());
  }, [dispatch]);

  return <CoreSettingsTab />;
};

CoreSettings.getLayout = function getLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default CoreSettings;
