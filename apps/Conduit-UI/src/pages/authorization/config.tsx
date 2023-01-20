import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import { asyncGetAuthzConfig } from '../../features/authorization/store/authorizationSlice';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';
import AuthorizationLayout from '../../features/authorization/authorizationLayout';

const AuthorizationConfig = dynamic(
  () => import('../../features/authorization/components/AuthorizationConfig'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Config = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetAuthzConfig());
  }, [dispatch]);

  return <AuthorizationConfig />;
};

Config.getLayout = function getLayout(page: ReactElement) {
  return <AuthorizationLayout>{page}</AuthorizationLayout>;
};

export default Config;
