import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '../../redux/store';
import CmsLayout from '../../components/navigation/InnerLayouts/cmsLayout';
import {
  asyncCreateCustomEndpoints,
  asyncDeleteCustomEndpoints,
  asyncGetCmsSchemas,
  asyncGetCustomEndpoints,
  asyncUpdateCustomEndpoints,
} from '../../redux/slices/cmsSlice';

import CustomQueries from '../../components/cms/custom-endpoints/CustomQueries';
import useDebounce from '../../hooks/useDebounce';

const Custom = () => {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState<string>('');
  const [operation, setOperation] = useState<number>(-2);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    dispatch(asyncGetCmsSchemas({ skip: 0, limit: 50, enabled: true }));
    dispatch(
      asyncGetCustomEndpoints({
        search: debouncedSearch,
        operation: operation !== -2 ? operation : undefined,
      })
    );
  }, [dispatch, debouncedSearch, operation]);

  const getEndpointsCallback = useCallback(() => {
    dispatch(asyncGetCustomEndpoints({ search, operation: operation }));
  }, [dispatch, search, operation]);

  const handleCreateCustomEndpoint = (data: any) => {
    if (data) {
      dispatch(
        asyncCreateCustomEndpoints({ endpointData: data, getEndpoints: getEndpointsCallback })
      );
    }
  };

  const handleDeleteCustomEndpoint = (endpointId: string) => {
    if (endpointId) {
      dispatch(asyncDeleteCustomEndpoints({ _id: endpointId, getEndpoints: getEndpointsCallback }));
    }
  };

  const handleEditCustomEndpoint = (_id: string, data: any) => {
    dispatch(
      asyncUpdateCustomEndpoints({ _id, endpointData: data, getEndpoints: getEndpointsCallback })
    );
  };

  return (
    <CustomQueries
      operation={operation}
      setOperation={setOperation}
      search={search}
      setSearch={setSearch}
      handleCreate={handleCreateCustomEndpoint}
      handleEdit={handleEditCustomEndpoint}
      handleDelete={handleDeleteCustomEndpoint}
    />
  );
};

Custom.getLayout = function getLayout(page: ReactElement) {
  return <CmsLayout>{page}</CmsLayout>;
};

export default Custom;
