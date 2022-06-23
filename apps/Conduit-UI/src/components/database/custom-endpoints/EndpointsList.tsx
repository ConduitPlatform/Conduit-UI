import React, { FC, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import {
  asyncAddCustomEndpoints,
  asyncSetCustomEndpoints,
} from '../../../redux/slices/databaseSlice';
import InfiniteScrollList from './InfiniteScrollList';

const timeoutAmount = 750;

interface Props {
  handleListItemSelect: (endpoint: any) => void;
  search: string;
  operation: number;
  selectedSchemas: string[];
}

const EndpointsList: FC<Props> = ({ handleListItemSelect, search, operation, selectedSchemas }) => {
  const dispatch = useAppDispatch();

  const infiniteLoaderRef = useRef<any>(null);
  const hasMountedRef = useRef(false);

  const { endpoints, count } = useAppSelector((state) => state.databaseSlice.data.customEndpoints);
  const { selectedEndpoint } = useAppSelector((state) => state.customEndpointsSlice.data);

  const isItemLoaded = (index: number) => !!endpoints[index];

  useEffect(() => {
    if (infiniteLoaderRef.current && hasMountedRef.current) {
      infiniteLoaderRef.current.resetloadMoreItemsCache();
      infiniteLoaderRef.current._listRef.scrollTo(0);
    }
    hasMountedRef.current = true;
    const params = {
      skip: 0,
      limit: 20,
      search: search,
      schemaName: selectedSchemas,
      operation: operation !== -2 ? operation : undefined,
    };
    dispatch(asyncSetCustomEndpoints(params));
  }, [dispatch, operation, search, selectedSchemas]);

  const addEndpoints = (skip: number, limit: number) => {
    const params = {
      skip: skip,
      limit: limit,
      search: search,
      schemaName: selectedSchemas,
      operation: operation !== -2 ? operation : undefined,
    };
    dispatch(asyncAddCustomEndpoints(params));
  };

  const debouncedGetApiItems = debounce(
    (skip: number, limit: number) => addEndpoints(skip, limit),
    timeoutAmount
  );

  const loadMoreItems = async (startIndex: number, stopIndex: number) => {
    const limit = stopIndex + 1;
    debouncedGetApiItems(endpoints.length, limit);
  };

  return (
    <InfiniteScrollList
      count={count}
      loadMoreItems={loadMoreItems}
      loaderRef={infiniteLoaderRef}
      isItemLoaded={isItemLoaded}
      listItems={endpoints}
      handleListItemSelect={handleListItemSelect}
      selectedEndpoint={selectedEndpoint}
    />
  );
};

export default EndpointsList;
