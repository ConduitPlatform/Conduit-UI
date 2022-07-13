import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import FormsLayout from '../../components/navigation/InnerLayouts/formsLayout';
import { asyncGetFormsConfig } from '../../redux/slices/formsSlice';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const FormsConfig = dynamic(() => import('../../components/forms/FormsConfig'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Config = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetFormsConfig());
  }, [dispatch]);

  return <FormsConfig />;
};

Config.getLayout = function getLayout(page: ReactElement) {
  return <FormsLayout>{page}</FormsLayout>;
};

export default Config;
