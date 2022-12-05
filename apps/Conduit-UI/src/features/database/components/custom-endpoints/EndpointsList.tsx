import React, { FC, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { asyncAddCustomEndpoints, asyncSetCustomEndpoints } from '../../store/databaseSlice';
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

  const { endpoints, count } = useAppSelector((state) => state.databaseSlice.data.customEndpoints);
  const { selectedEndpoint } = useAppSelector((state) => state.customEndpointsSlice.data);

  useEffect(() => {
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
    (limit: number) => addEndpoints(endpoints?.length, limit),
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
      count={count}
      loadMoreItems={loadMoreItems}
      listItems={endpoints}
      handleListItemSelect={handleListItemSelect}
      selectedEndpoint={selectedEndpoint}
      isEndpoint
    />
  );
};

export default EndpointsList;
