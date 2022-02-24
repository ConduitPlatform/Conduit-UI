import React, { FC, useEffect, useRef } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { debounce } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { makeStyles } from '@material-ui/core/styles';
import { Box, ListItem, ListItemIcon, ListItemText, Paper, Typography } from '@material-ui/core';
import { OperationsEnum } from '../../../models/OperationsEnum';
import { getOperation } from '../../../utils/getOperation';
import { Skeleton } from '@material-ui/lab';
import { asyncAddCustomEndpoints, asyncSetCustomEndpoints } from '../../../redux/slices/cmsSlice';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  listBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRight: '1px solid #000000',
    height: '100%',
  },
  divider: {
    '&.MuiDivider-root': {
      height: '2px',
      background: theme.palette.primary.main,
      borderRadius: '4px',
      margin: theme.spacing(0.5),
    },
  },
  button: {
    margin: theme.spacing(1),
    textTransform: 'none',
    color: 'white',
  },
  badge: {
    color: 'white',
    padding: theme.spacing(0.5),
    width: '65px',
    textAlign: 'center',
    marginRight: theme.spacing(1),
  },
  getBadge: {
    backgroundColor: '#61affe',
  },
  putBadge: {
    backgroundColor: '#fca130',
  },
  patchBadge: {
    backgroundColor: '#50e3c2',
  },
  postBadge: {
    backgroundColor: '#49cc90',
  },
  deleteBadge: {
    backgroundColor: '#f93e3e',
  },
  list: {
    '&.MuiList-root': {
      maxHeight: '580px',
      overflowY: 'auto',
      width: '100%',
    },
  },
  listItem: {
    '&.MuiListItem-root:hover': {
      background: theme.palette.grey[600],
      borderRadius: '4px',
    },
    '&.Mui-selected': {
      background: theme.palette.grey[700],
      borderRadius: '4px',
      color: '#ffffff',
    },
    '&.Mui-selected:hover': {
      background: theme.palette.grey[800],
      borderRadius: '4px',
      color: '#ffffff',
    },
  },
  actions: {
    padding: theme.spacing(1),
  },
  formControl: {
    minWidth: 150,
  },
  noEndpoints: {
    textAlign: 'center',
    marginTop: '100px',
  },
  loadMore: {
    textAlign: 'center',
  },
}));
const timeoutAmount = 750;

interface Props {
  handleListItemSelect: (endpoint: any) => void;
  search: string;
  operation: number;
  selectedSchemas: string[];
}

const EndpointsList: FC<Props> = ({ handleListItemSelect, search, operation, selectedSchemas }) => {
  const dispatch = useAppDispatch();
  const classes = useStyles();

  const infiniteLoaderRef = useRef<any>(null);
  const hasMountedRef = useRef(false);

  const { endpoints, count } = useAppSelector((state) => state.cmsSlice.data.customEndpoints);
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
          return clsx(classes.badge, classes.postBadge);
        case OperationsEnum.PUT:
          return clsx(classes.badge, classes.putBadge);
        case OperationsEnum.DELETE:
          return clsx(classes.badge, classes.deleteBadge);
        case OperationsEnum.GET:
          return clsx(classes.badge, classes.getBadge);
        case OperationsEnum.PATCH:
          return clsx(classes.badge, classes.patchBadge);
      }
    };

    return (
      <div style={style}>
        {!endpoint ? (
          <Typography variant="h2">
            <Skeleton />
          </Typography>
        ) : (
          <ListItem
            button
            key={`endpoint-${endpoint._id}`}
            className={classes.listItem}
            onClick={() => handleListItemSelect(endpoint)}
            selected={selectedEndpoint?._id === endpoint?._id}>
            <ListItemIcon>
              <Paper elevation={12} className={getBadgeColor(endpoint)}>
                {getOperation(endpoint)}
              </Paper>
            </ListItemIcon>
            <ListItemText
              primary={endpoint.name}
              primaryTypographyProps={{
                style: { overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' },
              }}
            />
          </ListItem>
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
              <Typography className={classes.noEndpoints}>No endpoints available</Typography>
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
