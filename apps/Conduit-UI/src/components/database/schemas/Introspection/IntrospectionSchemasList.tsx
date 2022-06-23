import React, { FC, useEffect, useRef } from 'react';
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

  const loaderRef = useRef<any>(null);
  const hasMountedRef = useRef(false);

  const { schemaDocuments, schemasCount } = useAppSelector(
    (state) => state.databaseSlice.data.introspectionSchemas
  );

  const isItemLoaded = (index: number) => !!schemaDocuments[index];

  useEffect(() => {
    if (loaderRef.current && hasMountedRef.current) {
      loaderRef.current.resetloadMoreItemsCache();
      loaderRef.current._listRef.scrollTo(0);
    }
    hasMountedRef.current = true;
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
      loaderRef={loaderRef}
      isItemLoaded={isItemLoaded}
      listItems={schemaDocuments}
      handleListItemSelect={handleListItemSelect}
      selectedEndpoint={actualSchema}
    />
  );
};

export default IntrospectionSchemasList;
