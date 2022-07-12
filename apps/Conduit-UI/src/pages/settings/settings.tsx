import React, { ReactElement, useEffect } from 'react';
import SettingsLayout from '../../components/navigation/InnerLayouts/settingsLayout';
import GeneralSettingsTab from '../../components/settings/GeneralSettingsTab';
import { asyncGetAdminSettings, asyncGetCoreSettings } from '../../redux/slices/settingsSlice';
import { useAppDispatch } from '../../redux/store';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const GeneralSettingsTab = dynamic(() => import('../../components/settings/GeneralSettingsTab'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
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
