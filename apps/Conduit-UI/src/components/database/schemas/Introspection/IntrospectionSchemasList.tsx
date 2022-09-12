import React, { FC, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import {
  asyncAddIntroSpectionSchemas,
  asyncGetIntrospectionSchemas,
} from '../../../../redux/slices/databaseSlice';
import { Schema } from '../../../../models/database/CmsModels';
import InfiniteScrollList from '../../custom-endpoints/InfiniteScrollList';

const timeoutAmount = 750;

interface Props {
  handleListItemSelect: (endpoint: string) => void;
  search: string;
  actualSchema?: Schema;
}

const IntrospectionSchemasList: FC<Props> = ({ handleListItemSelect, search, actualSchema }) => {
  const dispatch = useAppDispatch();

  const { schemaDocuments, schemasCount } = useAppSelector(
    (state) => state.databaseSlice.data.introspectionSchemas
  );

  useEffect(() => {
    const params = {
      skip: 0,
      limit: 25,
      search: search,
    };
    dispatch(asyncGetIntrospectionSchemas(params));
  }, [dispatch, search]);

  const addSchemas = (skip: number, limit: number) => {
    const params = {
      skip: skip,
      limit: limit,
      search: search,
    };
    dispatch(asyncAddIntroSpectionSchemas(params));
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

export default IntrospectionSchemasList;
