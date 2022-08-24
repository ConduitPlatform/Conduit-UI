import React, { FC, useMemo, useRef } from 'react';
import { Box, ListItemText, Tooltip } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import { Circle } from '@mui/icons-material';
import { logsDateText } from '../../theme';
import memoize from 'memoize-one';
import moment from 'moment';
import { Virtuoso } from 'react-virtuoso';
import ColorHash from 'color-hash';
import { LogsData } from '../../models/logs/LogsModels';

interface Props {
  data: LogsData[];
  // loadMore: () => void;
}

const createItemData = memoize((logs, count) => ({
  logs,
  count,
}));

const LogsList: FC<Props> = ({
  data,
  // loadMore
}) => {
  const listRef = useRef<any>(null);
  const colorHash = new ColorHash();

  const count = useMemo(() => {
    return data?.length;
  }, [data?.length]);

  const itemData = createItemData(data, count);

  const ListRow = ({ index }: any) => {
    const { logs, count } = itemData;
    const rowItem = logs[count - index - 1];

    const handleBackgroundBubble = () => {
      return rowItem?.instance ? colorHash.hex(rowItem?.instance) : 'gray';
    };

    const handleBackgroundLabel = () => {
      switch (rowItem?.level) {
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
      <ListItem
        key={rowItem?.timestamp}
        component="div"
        disablePadding
        sx={{ alignItems: 'stretch', paddingY: 1 }}>
        <Box
          sx={{
            display: 'flex',
            marginRight: 3,
          }}>
          <Tooltip title={rowItem?.instance ? rowItem?.instance : ''} placement={'bottom-start'}>
            <Circle sx={{ color: handleBackgroundBubble }} />
          </Tooltip>
          <ListItemText
            primary={moment(rowItem?.timestamp / 1000000).format('MMM DD YYYY, hh:mm:ss a')}
            sx={{ marginTop: 0, marginLeft: 1 }}
            primaryTypographyProps={{ noWrap: true, sx: { fontSize: logsDateText } }}
          />
        </Box>
        <Tooltip title={rowItem?.level ? rowItem?.level : ''} placement={'left-end'}>
          <Box
            sx={{
              minWidth: 6,
              borderRadius: 1,
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
            wordBreak: 'break-all',
            alignSelf: 'center',
          }}
          primary={rowItem?.message}
        />
      </ListItem>
    );
  };

  return (
    <Virtuoso
      ref={listRef}
      style={{ height: '100%', width: '100%' }}
      totalCount={count}
      // overscan={10}
      itemContent={(index) => <ListRow index={index} />}
      // startReached={loadMore}
      initialTopMostItemIndex={count}
    />
  );
};

export default LogsList;
