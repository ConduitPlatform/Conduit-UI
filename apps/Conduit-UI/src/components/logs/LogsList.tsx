import React, { FC, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { useAppDispatch } from '../../redux/store';
import { Box, ListItemText, Tooltip } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import { Circle } from '@mui/icons-material';
import { logsDateText } from '../../theme';
import memoize from 'memoize-one';
import moment from 'moment';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';

const timeoutAmount = 750;

interface Props {
  loaderRef: any;
  data: string[];
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

  const count = data?.length;

  const isItemLoaded = (index: number) => !!data[index];

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
  };

  const debouncedGetApiItems = debounce(
    (skip: number, limit: number) => getLogs(skip, limit),
    timeoutAmount
  );

  const loadMoreItems = async (startIndex: number) => {
    const limit = count - startIndex - data?.length;
    debouncedGetApiItems(data?.length, limit);
  };

  const itemData = createItemData(data, count);

  const ListRow = ({ data, index, style, parent }) => {
    const { logs, count } = itemData;
    const rowItem = logs[count - index - 1];

    const handleBackgroundBubble = () => {
      //FIXME: color
      switch (rowItem?.[3]) {
        case 'info':
          return '#353523';
        case 'warn':
          return '#987251';
        default:
          return 'white';
      }
    };

    const handleBackgroundLabel = () => {
      //FIXME: color
      switch (rowItem?.[2]) {
        case 'info':
          return 'gray';
        case 'warn':
          return 'yellow';
        default:
          return 'white';
      }
    };

    return (
      <CellMeasurer key={index} cache={cache} parent={parent} columnIndex={0} rowIndex={index}>
        {({ measure, registerChild }) => (
          <ListItem ref={registerChild} style={style}>
            <Box
              sx={{
                display: 'flex',
                height: '100%',
                marginRight: 3,
              }}>
              <Tooltip title={rowItem?.[3]} placement={'bottom-start'}>
                <Circle sx={{ color: handleBackgroundBubble }} />
              </Tooltip>
              <ListItemText
                primary={moment(rowItem?.[0] / 1000000).format('MMMM Do YYYY, h:mm:ss a')}
                sx={{ marginTop: 0, marginLeft: 1 }}
                primaryTypographyProps={{ noWrap: true, sx: { fontSize: logsDateText } }}
              />
            </Box>
            <Tooltip title={rowItem?.[2]} placement={'left-end'}>
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
                flex: 1,
                margin: 0,
                marginLeft: 1,
                whiteSpace: 'normal',
                wordWrap: 'break-word',
              }}
              primaryTypographyProps={{
                width: '100%',
              }}
              primary={rowItem[1]}
            />
          </ListItem>
        )}
      </CellMeasurer>
    );
  };

  return (
    <AutoSizer>
      {({ width, height }) => {
        return (
          <List
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
    </AutoSizer>
  );
};

export default LogsList;
