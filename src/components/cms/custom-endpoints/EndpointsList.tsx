import React, { CSSProperties, FC, useCallback, useEffect, useRef } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { debounce } from 'lodash';
import { useAppDispatch } from '../../../redux/store';
import { makeStyles } from '@material-ui/core/styles';
import { ListItem, ListItemIcon, ListItemText, Paper, Typography } from '@material-ui/core';
import OperationsEnum from '../../../models/OperationsEnum';
import { getOperation } from '../../../utils/getOperation';
import { Skeleton } from '@material-ui/lab';
import { asyncGetCustomEndpoints, clearEndpoints } from '../../../redux/slices/cmsSlice';
import { useAppSelector } from '../../../redux/store';

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
  getBadge: {
    backgroundColor: '#61affe',
    color: 'white',
    padding: theme.spacing(0.5),
    width: '65px',
    textAlign: 'center',
    marginRight: theme.spacing(1),
  },
  putBadge: {
    backgroundColor: '#fca130',
    color: 'white',
    padding: theme.spacing(0.5),
    width: '65px',
    textAlign: 'center',
    marginRight: theme.spacing(1),
  },
  patchBadge: {
    backgroundColor: '#50e3c2',
    color: 'white',
    padding: theme.spacing(0.5),
    width: '65px',
    textAlign: 'center',
    marginRight: theme.spacing(1),
  },
  postBadge: {
    backgroundColor: '#49cc90',
    padding: theme.spacing(0.5),
    width: '65px',
    textAlign: 'center',
    marginRight: theme.spacing(1),
  },
  deleteBadge: {
    backgroundColor: '#f93e3e',
    padding: theme.spacing(0.5),
    width: '65px',
    textAlign: 'center',
    marginRight: theme.spacing(1),
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
interface ItemStatus {
  [key: string]: string;
}
const timeoutAmount = 750;
let tabsStatusMap: ItemStatus = {};

const isItemLoaded = (index: number) => !!tabsStatusMap[index];

interface Props {
  handleListItemSelect: (endpoint: any) => void;
  search: string;
  operation: number;
}

const EndpointsList: FC<Props> = ({ handleListItemSelect, search, operation }) => {
  const dispatch = useAppDispatch();
  const classes = useStyles();

  const infiniteLoaderRef = useRef<any>(null);
  const hasMountedRef = useRef(false);

  const { endpoints, count } = useAppSelector((state) => state.cmsSlice.data.customEndpoints);
  const { selectedEndpoint } = useAppSelector((state) => state.customEndpointsSlice.data);

  useEffect(() => {
    if (infiniteLoaderRef.current && hasMountedRef.current) {
      infiniteLoaderRef.current.resetloadMoreItemsCache(true);
      tabsStatusMap = {};
    }
    hasMountedRef.current = true;
    dispatch(clearEndpoints());
  }, [search, operation, dispatch]);

  const getEndpoints = useCallback(
    (skip: number, limit: number) => {
      const params = {
        skip: skip,
        limit: limit,
        search: search,
        operation: operation !== -2 ? operation : undefined,
      };
      dispatch(asyncGetCustomEndpoints(params));
    },
    [search, operation, dispatch]
  );

  const debouncedGetApiItems = debounce(
    (skip: number, limit: number) => getEndpoints(skip, limit),
    timeoutAmount
  );

  const loadMoreItems = useCallback(
    async (startIndex: number, stopIndex: number) => {
      const limit = stopIndex + 1;
      debouncedGetApiItems(endpoints.length, limit);
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          for (let index = startIndex; index <= stopIndex; index++) {
            tabsStatusMap[index] = 'LOADED';
          }
          resolve(undefined);
          clearTimeout(timeout);
        }, timeoutAmount);
        return timeout;
      });
    },
    [debouncedGetApiItems, endpoints.length]
  );

  useEffect(() => {
    getEndpoints(0, 15);
  }, [getEndpoints, operation]);

  const EndpointRow = ({ data, index, style }: ListChildComponentProps) => {
    const rowItem = endpoints[index];
    const loading = !(tabsStatusMap[index] === 'LOADED' && rowItem);

    const getBadgeColor = (endpoint: any) => {
      if (endpoint.operation === OperationsEnum.POST) {
        return classes.postBadge;
      }
      if (endpoint.operation === OperationsEnum.PUT) {
        return classes.putBadge;
      }
      if (endpoint.operation === OperationsEnum.DELETE) {
        return classes.deleteBadge;
      }
      if (endpoint.operation === OperationsEnum.GET) {
        return classes.getBadge;
      }
      if (endpoint.operation === OperationsEnum.PATCH) {
        return classes.patchBadge;
      }
    };

    return (
      <div style={style as CSSProperties}>
        {loading ? (
          <Typography variant="h2">
            <Skeleton />
          </Typography>
        ) : (
          <ListItem
            button
            key={`endpoint-${rowItem._id}`}
            className={classes.listItem}
            onClick={() => handleListItemSelect(rowItem)}
            selected={selectedEndpoint?._id === rowItem?._id}>
            <ListItemIcon>
              <Paper elevation={12} className={getBadgeColor(rowItem)}>
                {getOperation(rowItem)}
              </Paper>
            </ListItemIcon>
            <ListItemText primary={rowItem.name} />
          </ListItem>
        )}
      </div>
    );
  };

  return (
    <AutoSizer>
      {({ height, width }) => {
        if (!count) {
          return <></>;
        }
        return (
          <InfiniteLoader
            ref={infiniteLoaderRef}
            isItemLoaded={isItemLoaded}
            itemCount={count}
            loadMoreItems={loadMoreItems}>
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
