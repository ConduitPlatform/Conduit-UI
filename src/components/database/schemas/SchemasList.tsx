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
import { Schema } from '../../../models/database/CmsModels';

const useStyles = makeStyles((theme) => ({
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
              <Typography sx={{ textAlign: 'center', marginTop: '100px' }}>
                No schemas available
              </Typography>
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
