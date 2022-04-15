import React, { FC, useEffect, useRef } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { debounce } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { Box, ListItemButton, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material';
import { OperationsEnum } from '../../../models/OperationsEnum';
import { getOperation } from '../../../utils/getOperation';
import { Skeleton } from '@mui/material';
import {
  asyncAddCustomEndpoints,
  asyncSetCustomEndpoints,
} from '../../../redux/slices/databaseSlice';

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

  const EndpointRow = ({ index, style }: ListChildComponentProps) => {
    const endpoint = endpoints[index];

    const getBadgeColor = (endpointForBadge: any) => {
      switch (endpointForBadge.operation) {
        case OperationsEnum.POST:
          return '#49cc90';
        case OperationsEnum.PUT:
          return '#fca130';
        case OperationsEnum.DELETE:
          return '#f93e3e';
        case OperationsEnum.GET:
          return '#61affe';
        case OperationsEnum.PATCH:
          return '#50e3c2';
      }
    };

    return (
      <div style={style}>
        {!endpoint ? (
          <Typography variant="h2">
            <Skeleton />
          </Typography>
        ) : (
          <ListItemButton
            sx={{
              '&.MuiListItemButton-root': {
                '&.Mui-selected': {
                  background: 'secondary',
                },
                borderRadius: '10px',
              },
            }}
            key={`endpoint-${endpoint._id}`}
            onClick={() => handleListItemSelect(endpoint)}
            selected={selectedEndpoint?._id === endpoint?._id}>
            <ListItemIcon>
              <Paper
                elevation={12}
                sx={{
                  color: 'white',
                  padding: 0.2,
                  width: '65px',
                  textAlign: 'center',
                  marginRight: 1,
                  backgroundColor: getBadgeColor(endpoint),
                }}>
                {getOperation(endpoint)}
              </Paper>
            </ListItemIcon>
            <ListItemText
              primary={endpoint.name}
              primaryTypographyProps={{
                style: { overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' },
              }}
            />
          </ListItemButton>
        )}
      </div>
    );
  };

  return (
    <AutoSizer>
      {({ height, width }) => {
        if (!count) {
          return (
            <Box width={width}>
              <Typography sx={{ textAlign: 'center', marginTop: '100px' }}>
                No endpoints available
              </Typography>
            </Box>
          );
        }
        return (
          <InfiniteLoader
            ref={infiniteLoaderRef}
            isItemLoaded={isItemLoaded}
            itemCount={count}
            loadMoreItems={loadMoreItems}
            threshold={4}>
            {({ onItemsRendered, ref }) => {
              return (
                <List
                  height={height}
                  itemCount={count}
                  itemSize={56}
                  onItemsRendered={onItemsRendered}
                  ref={ref}
                  width={width}>
                  {EndpointRow}
                </List>
              );
            }}
          </InfiniteLoader>
        );
      }}
    </AutoSizer>
  );
};

export default EndpointsList;
