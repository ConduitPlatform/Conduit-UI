import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import FormsLayout from '../../components/navigation/InnerLayouts/formsLayout';
import { asyncGetFormsConfig } from '../../redux/slices/formsSlice';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const FormsConfig = dynamic(() => import('../../components/forms/FormsConfig'), {
  loading: () => <LoaderComponent />,
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
