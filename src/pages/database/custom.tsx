import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import { asyncGetCmsSchemas } from '../../redux/slices/databaseSlice';
import CustomQueries from '../../components/database/custom-endpoints/CustomQueries';
import DatabaseLayout from '../../components/navigation/InnerLayouts/databaseLayout';

const Custom = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetCmsSchemas({ skip: 0, limit: 50, enabled: true }));
  }, [dispatch]);

  return <CustomQueries />;
};

Custom.getLayout = function getLayout(page: ReactElement) {
  return <DatabaseLayout>{page}</DatabaseLayout>;
};

export default Custom;
