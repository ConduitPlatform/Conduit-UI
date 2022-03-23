import React, { FC, useEffect, useRef } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { debounce } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import makeStyles from '@mui/styles/makeStyles';
import { Box, ListItem, ListItemText, Typography } from '@mui/material';
import { Skeleton } from '@mui/material';
import { asyncAddSchemas, asyncGetSchemas } from '../../../redux/slices/databaseSlice';
import clsx from 'clsx';
import { Schema } from '../../../models/database/CmsModels';

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
  const classes = useStyles();

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

  const SchemaRow = ({ index, style }: ListChildComponentProps) => {
    const schema = schemaDocuments[index];

    return (
      <div style={style}>
        {!schema ? (
          <Typography variant="h2">
            <Skeleton />
          </Typography>
        ) : (
          <ListItem
            button
            key={`endpoint-${schema._id}`}
            className={classes.listItem}
            onClick={() => handleListItemSelect(schema.name)}
            selected={actualSchema?._id === schema?._id}>
            <ListItemText primary={schema.name} />
          </ListItem>
        )}
      </div>
    );
  };

  return (
    <AutoSizer>
      {({ height, width }) => {
        if (!schemasCount) {
          return (
            <Box width={width}>
              <Typography className={classes.noEndpoints}>No schemas available</Typography>
            </Box>
          );
        }
        return (
          <InfiniteLoader
            ref={infiniteLoaderRef}
            isItemLoaded={isItemLoaded}
            itemCount={schemasCount}
            loadMoreItems={loadMoreItems}
            threshold={4}>
            {({ onItemsRendered, ref }) => {
              return (
                <List
                  height={height}
                  itemCount={schemasCount}
                  itemSize={50}
                  onItemsRendered={onItemsRendered}
                  ref={ref}
                  width={width}>
                  {SchemaRow}
                </List>
              );
            }}
          </InfiniteLoader>
        );
      }}
    </AutoSizer>
  );
};

export default SchemasList;
