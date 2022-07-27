import React, { ReactElement, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';
import AuthenticationLayout from '../../components/navigation/InnerLayouts/authenticationLayout';
import { useAppDispatch } from '../../redux/store';
import { asyncGetAuthenticationLogs } from '../../redux/slices/authenticationSlice';

const AuthenticationLogs = dynamic(() => import('../../components/logs/LogsComponent'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Logs = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetAuthenticationLogs());
  }, [dispatch]);
  return <AuthenticationLogs />;
};

Logs.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default Logs;
