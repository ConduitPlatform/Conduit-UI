import React, { ReactElement, useEffect } from 'react';
import SettingsLayout from '../../features/settings/settingsLayout';
import {
  asyncGetAdminSettings,
  asyncGetCoreSettings,
} from '../../features/settings/store/settingsSlice';
import { useAppDispatch } from '../../redux/store';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const GeneralSettingsTab = dynamic(
  () => import('../../features/settings/components/GeneralSettingsTab'),
  {
    loading: () => <LoaderComponent />,
  }
);

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
