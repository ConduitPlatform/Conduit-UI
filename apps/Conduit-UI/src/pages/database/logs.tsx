import React, { ReactElement, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { useAppDispatch } from '../../redux/store';
import { clearQuery } from '../../redux/slices/authenticationSlice';
import DatabaseLayout from '../../components/navigation/InnerLayouts/databaseLayout';

const DatabaseLogs = dynamic(() => import('../../components/logs/LogsComponent'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Logs = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clearQuery());
  }, [dispatch]);

  return <DatabaseLogs />;
};

Logs.getLayout = function getLayout(page: ReactElement) {
  return <DatabaseLayout>{page}</DatabaseLayout>;
};

export default Logs;
