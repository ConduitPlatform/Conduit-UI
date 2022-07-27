import React, { FC, useEffect, useMemo, useRef } from 'react';
import { debounce } from 'lodash';
import { useAppDispatch } from '../../redux/store';
import { Box, ListItemText, Tooltip, Typography } from '@mui/material';
import InfiniteLoader from 'react-window-infinite-loader';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import ListItem from '@mui/material/ListItem';
import { Circle } from '@mui/icons-material';
import { logsDateText } from '../../theme';
import memoize from 'memoize-one';

const timeoutAmount = 750;

interface Props {
  loaderRef: any;
  data: string[];
}

const ListRow = ({ data, index, style }: ListChildComponentProps) => {
  const { logs, count, setRowHeight } = data;
  const rowItem = logs[count - index - 1];
  const rowRef = useRef<any>({});

  useEffect(() => {
    if (rowRef.current) {
      setRowHeight(index, rowRef.current.clientHeight);
    }
  }, [rowRef]);

  const handleBackgroundBubble = useMemo(() => {
    //FIXME: color
    return '#562446';
  }, []);

  const handleBackgroundLabel = useMemo(() => {
    //FIXME: color
    return '#FF0000';
  }, []);

  return (
    <ListItem key={index} style={style}>
      <Box
        sx={{
          display: 'flex',
          // flex: 1,
          alignItems: 'center',
          marginRight: 3,
        }}>
        <Tooltip title={'something'} placement={'bottom-start'}>
          <Circle sx={{ color: handleBackgroundBubble }} />
        </Tooltip>
        <ListItemText
          primary={'[2022-07-26T15:08:58.800Z]'}
          sx={{ margin: 0 }}
          primaryTypographyProps={{ noWrap: true, sx: { fontSize: logsDateText } }}
        />
      </Box>
      <Box sx={{ minWidth: 4, height: '100%', backgroundColor: handleBackgroundLabel }} />
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          overflowWrap: 'anywhere',
        }}>
        <ListItemText
          sx={{ display: 'flex', margin: 0, marginLeft: 1 }}
          primaryTypographyProps={{ width: 'auto' }}
          primary={rowItem}
        />
      </Box>
    </ListItem>
  );
};

const createItemData = memoize((logs, count, setRowHeight) => ({
  logs,
  count,
  setRowHeight,
}));

const LogsList: FC<Props> = ({ loaderRef, data }) => {
  const dispatch = useAppDispatch();
  const infiniteLoaderRef = useRef<any>(null);
  const hasMountedRef = useRef(false);
  const rowHeights = useRef<any>({});

  const count = data?.length;

  const isItemLoaded = (index: number) => !!data[index];

  const getRowHeight = (index: number) => {
    return rowHeights.current[index] + 8 || 56;
  };

  const setRowHeight = (index: number, size: number) => {
    // infiniteLoaderRef.current._listRef.resetAfterIndex(0);
    rowHeights.current = { ...rowHeights.current, [index]: size };
  };

  useEffect(() => {
    if (infiniteLoaderRef.current && hasMountedRef.current) {
      infiniteLoaderRef.current.resetloadMoreItemsCache();
      infiniteLoaderRef.current._listRef.scrollTo(0);
    }
    hasMountedRef.current = true;
  }, [dispatch]);

  const getLogs = (skip: number, limit: number) => {
    const params = {
      skip: skip,
      limit: limit,
    };
    //TODO: request to get more
  };

  const debouncedGetApiItems = debounce(
    (skip: number, limit: number) => getLogs(skip, limit),
    timeoutAmount
  );

  const loadMoreItems = async (startIndex: number) => {
    const limit = count - startIndex - data?.length;
    debouncedGetApiItems(data?.length, limit);
  };

  const itemData = createItemData(data, count, setRowHeight);

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
            ref={loaderRef}
            isItemLoaded={isItemLoaded}
            itemCount={count}
            loadMoreItems={loadMoreItems}
            threshold={4}>
            {({ onItemsRendered, ref }) => {
              return (
                <List
                  height={height}
                  itemCount={count}
                  itemSize={(index) => getRowHeight(count - index - 1)}
                  itemData={itemData}
                  initialScrollOffset={count * 500}
                  onItemsRendered={onItemsRendered}
                  ref={ref}
                  width={width}>
                  {ListRow}
                </List>
              );
            }}
          </InfiniteLoader>
        );
      }}
    </AutoSizer>
  );
};

export default LogsList;
