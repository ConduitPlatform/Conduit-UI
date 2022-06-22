import React, { FC, useEffect, useRef } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { debounce } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { Box, ListItemButton, ListItemText, Typography } from '@mui/material';
import { Skeleton } from '@mui/material';
import {
  asyncAddIntroSpectionSchemas,
  asyncGetIntrospectionSchemas,
} from '../../../../redux/slices/databaseSlice';
import { Schema } from '../../../../models/database/CmsModels';

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

  const SchemaRow = ({ index, style }: ListChildComponentProps) => {
    const schema = schemaDocuments[index];

    return (
      <div style={style}>
        {!schema ? (
          <Typography variant="h2">
            <Skeleton />
          </Typography>
        ) : (
          <ListItemButton
            sx={{
              borderRadius: '10px',
              '&.MuiListItemButton-root': {
                '&.Mui-selected': {
                  background: 'secondary',
                },
              },
            }}
            key={`endpoint-${schema._id}`}
            onClick={() => handleListItemSelect(schema.name)}
            selected={actualSchema?._id === schema?._id}>
            <ListItemText
              primary={schema.name}
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
            ref={loaderRef}
            isItemLoaded={isItemLoaded}
            itemCount={schemasCount}
            loadMoreItems={loadMoreItems}
            threshold={4}>
            {({ onItemsRendered, ref }) => {
              return (
                <List
                  height={height}
                  itemCount={schemasCount}
                  itemSize={56}
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

export default IntrospectionSchemasList;
