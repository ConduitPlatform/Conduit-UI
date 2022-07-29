import React, { FC, useCallback, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { useAppDispatch } from '../../redux/store';
import { Box, ListItemText, Tooltip } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import { Circle } from '@mui/icons-material';
import { logsDateText } from '../../theme';
import memoize from 'memoize-one';
import moment from 'moment';
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
} from 'react-virtualized';
import ReactResizeDetector from 'react-resize-detector';

const timeoutAmount = 750;

interface Props {
  loaderRef: any;
  data: Array<Array<string>>;
}

const cache = new CellMeasurerCache({
  fixedWidth: true,
  defaultHeight: 100,
});

const createItemData = memoize((logs, count) => ({
  logs,
  count,
}));

const LogsList: FC<Props> = ({ loaderRef, data }) => {
  const dispatch = useAppDispatch();
  const infiniteLoaderRef = useRef<any>(null);
  const hasMountedRef = useRef(false);

  const count = data?.length - 1;

  const isRowLoaded = ({ index }) => !!data[index];

  useEffect(() => {
    if (infiniteLoaderRef.current && hasMountedRef.current) {
      infiniteLoaderRef.current.resetloadMoreItemsCache();
    }
    hasMountedRef.current = true;
  }, [dispatch]);

  const getLogs = (skip: number, limit: number) => {
    const params = {
      skip: skip,
      limit: limit,
    };
    //TODO: request to get more
    console.log('get items');
  };

  const debouncedGetApiItems = debounce(
    (skip: number, limit: number) => getLogs(skip, limit),
    timeoutAmount
  );

  const loadMoreItems = async (startIndex: number, stopIndex: number) => {
    // const limit = count - startIndex - data?.length;
    // debouncedGetApiItems(data?.length, limit);
  };

  const itemData = createItemData(data, count);

  const ListRow = ({ key, index, style, isScrolling, parent }) => {
    const { logs, count } = itemData;
    const rowItem = logs[count - index - 1];

    const handleBackgroundBubble = () => {
      //FIXME: color
      switch (rowItem?.[3]) {
        default:
          return 'gray';
      }
    };

    const handleBackgroundLabel = () => {
      switch (rowItem?.[2]) {
        case 'info':
          return 'blue';
        case 'warn':
          return 'yellow';
        case 'error':
          return 'red';
        default:
          return 'gray';
      }
    };

    return (
      <CellMeasurer
        key={key}
        cache={cache}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
        style={style}>
        {({ measure }) => (
          <ReactResizeDetector handleWidth handleHeight onResize={measure}>
            {({ width, height, targetRef }) => (
              <ListItem style={style} ref={targetRef}>
                <Box
                  sx={{
                    display: 'flex',
                    height: '100%',
                    marginRight: 3,
                  }}>
                  <Tooltip title={rowItem?.[3] ? rowItem?.[3] : ''} placement={'bottom-start'}>
                    <Circle sx={{ color: handleBackgroundBubble }} />
                  </Tooltip>
                  <ListItemText
                    primary={moment(rowItem?.[0] / 1000000).format('MMMM Do YYYY, hh:mm:ss a')}
                    sx={{ marginTop: 0, marginLeft: 1 }}
                    primaryTypographyProps={{ noWrap: true, sx: { fontSize: logsDateText } }}
                  />
                </Box>
                <Tooltip title={rowItem?.[2] ? rowItem?.[2] : ''} placement={'left-end'}>
                  <Box
                    sx={{
                      minWidth: 6,
                      borderRadius: 1,
                      height: '100%',
                      backgroundColor: handleBackgroundLabel,
                    }}
                  />
                </Tooltip>
                <ListItemText
                  sx={{
                    display: 'flex',
                    flexGrow: 1,
                    margin: 0,
                    marginLeft: 1,
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                  }}
                  primaryTypographyProps={{
                    width: '100%',
                  }}
                  primary={rowItem?.[1]}
                />
              </ListItem>
            )}
          </ReactResizeDetector>
        )}
      </CellMeasurer>
    );
  };

  return (
    <AutoSizer>
      {({ width, height }) => {
        // return (
        // <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={loadMoreItems} rowCount={count}>
        //   {({ onRowsRendered, registerChild }) => {
        return (
          <List
            ref={registerChild}
            onRowsRendered={onRowsRendered}
            // scrollToIndex={data.length - 1}
            width={width}
            height={height}
            deferredMeasurementCache={cache}
            rowHeight={cache.rowHeight}
            rowRenderer={ListRow}
            rowCount={count}
            overscanRowCount={3}
          />
        );
      }}
      {/*</InfiniteLoader>*/}
      {/*);*/}
      {/*}}*/}
    </AutoSizer>
  );
};

export default LogsList;
