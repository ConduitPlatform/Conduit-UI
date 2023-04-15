import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import FunctionsLayout from '../../features/functions/functionsLayout';
import { asyncGetFunctionsConfig } from '../../features/functions/store/functionsSlice';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const FunctionsConfig = dynamic(
  () => import('../../features/functions/components/FunctionsConfig'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Config = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetFunctionsConfig());
  }, [dispatch]);

  return <FunctionsConfig />;
};

Config.getLayout = function getLayout(page: ReactElement) {
  return <FunctionsLayout>{page}</FunctionsLayout>;
};

export default Config;
