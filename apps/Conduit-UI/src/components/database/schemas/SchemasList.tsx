import React, { FC, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { asyncAddSchemas, asyncGetSchemas } from '../../../redux/slices/databaseSlice';
import { Schema } from '../../../models/database/CmsModels';
import InfiniteScrollList from '../custom-endpoints/InfiniteScrollList';

const timeoutAmount = 750;

interface Props {
  handleListItemSelect: (endpoint: any) => void;
  search: string;
  owners: string[];
  enabled: boolean;
  actualSchema?: Schema;
}

const SchemasList: FC<Props> = ({
  handleListItemSelect,
  search,
  owners,
  enabled,
  actualSchema,
}) => {
  const dispatch = useAppDispatch();

  const { schemaDocuments, schemasCount } = useAppSelector(
    (state) => state.databaseSlice.data.schemas
  );

  useEffect(() => {
    const params = {
      skip: 0,
      limit: 25,
      search: search,
      owner: owners,
      enabled: enabled,
    };
    dispatch(asyncGetSchemas(params));
  }, [dispatch, search, owners, enabled]);

  const addSchemas = (skip: number, limit: number) => {
    const params = {
      skip: skip,
      limit: limit,
      search: search,
      owner: owners,
      enabled: enabled,
    };
    dispatch(asyncAddSchemas(params));
  };

  const debouncedGetApiItems = debounce(
    (limit: number) => addSchemas(schemaDocuments?.length, limit),
    timeoutAmount
  );

  const loadMoreItems = useCallback(
    (index) => {
      const limit = index + 1;

      debouncedGetApiItems(limit);
      return () => debouncedGetApiItems.cancel();
    },
    [debouncedGetApiItems]
  );

  return (
    <InfiniteScrollList
      count={schemasCount}
      loadMoreItems={loadMoreItems}
      listItems={schemaDocuments}
      handleListItemSelect={handleListItemSelect}
      selectedEndpoint={actualSchema}
    />
  );
};

export default SchemasList;
