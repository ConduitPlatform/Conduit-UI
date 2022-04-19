import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import FormsConfig from '../../components/forms/FormsConfig';
import FormsLayout from '../../components/navigation/InnerLayouts/formsLayout';
import { asyncGetFormsConfig } from '../../redux/slices/formsSlice';

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
