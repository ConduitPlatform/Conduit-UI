import React, { FC, useEffect, useRef } from 'react';
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

  const infiniteLoaderRef = useRef<any>(null);
  const hasMountedRef = useRef(false);

  const { schemaDocuments, schemasCount } = useAppSelector(
    (state) => state.databaseSlice.data.schemas
  );

  const isItemLoaded = (index: number) => !!schemaDocuments[index];

  useEffect(() => {
    if (infiniteLoaderRef.current && hasMountedRef.current) {
      infiniteLoaderRef.current.resetloadMoreItemsCache();
      infiniteLoaderRef.current._listRef.scrollTo(0);
    }
    hasMountedRef.current = true;
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
    (skip: number, limit: number) => addSchemas(skip, limit),
    timeoutAmount
  );

  const loadMoreItems = async (startIndex: number, stopIndex: number) => {
    const limit = stopIndex + 1;
    debouncedGetApiItems(schemaDocuments.length, limit);
  };

  return (
    <InfiniteScrollList
      count={schemasCount}
      loadMoreItems={loadMoreItems}
      loaderRef={infiniteLoaderRef}
      isItemLoaded={isItemLoaded}
      listItems={schemaDocuments}
      handleListItemSelect={handleListItemSelect}
      selectedEndpoint={actualSchema}
    />
  );
};

export default SchemasList;
