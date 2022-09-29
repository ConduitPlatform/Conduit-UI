import React, { ReactElement, useEffect } from 'react';
import SettingsLayout from '../../components/navigation/InnerLayouts/settingsLayout';
import { asyncGetAdminSettings, asyncGetCoreSettings } from '../../redux/slices/settingsSlice';
import { useAppDispatch } from '../../redux/store';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const GeneralSettingsTab = dynamic(() => import('../../components/settings/GeneralSettingsTab'), {
  loading: () => <LoaderComponent />,
});

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
