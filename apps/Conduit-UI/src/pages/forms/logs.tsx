import React, { ReactElement, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { useAppDispatch } from '../../redux/store';
import { clearQuery } from '../../redux/slices/authenticationSlice';
import FormsLayout from '../../components/navigation/InnerLayouts/formsLayout';

const FormsLogs = dynamic(() => import('../../components/logs/LogsComponent'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Logs = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clearQuery());
  }, [dispatch]);

  return <FormsLogs />;
};

Logs.getLayout = function getLayout(page: ReactElement) {
  return <FormsLayout>{page}</FormsLayout>;
};

export default Logs;
