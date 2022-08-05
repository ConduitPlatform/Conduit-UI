import React, { FC, useEffect, useMemo, useRef } from 'react';
import { Box, ListItemText, Tooltip } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import { Circle } from '@mui/icons-material';
import { logsDateText } from '../../theme';
import memoize from 'memoize-one';
import moment from 'moment';
import { Virtuoso } from 'react-virtuoso';

interface Props {
  data: Array<Array<string>>;
}

const createItemData = memoize((logs, count) => ({
  logs,
  count,
}));

const LogsList: FC<Props> = ({ data }) => {
  const listRef = useRef<any>(null);

  const count = useMemo(() => {
    return data?.length;
  }, [data?.length]);

  useEffect(() => {
    listRef?.current?.scrollToIndex({ index: count, behavior: 'auto', align: 'end' });
  }, [count, data]);

  const itemData = createItemData(data, count);

  const ListRow = ({ index }: any) => {
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
      <ListItem
        key={rowItem?.[0]}
        component="div"
        disablePadding
        sx={{ alignItems: 'stretch', paddingY: 1 }}>
        <Box
          sx={{
            display: 'flex',
            marginRight: 3,
          }}>
          <Tooltip title={rowItem?.[3] ? rowItem?.[3] : ''} placement={'bottom-start'}>
            <Circle sx={{ color: handleBackgroundBubble }} />
          </Tooltip>
          <ListItemText
            primary={moment(rowItem?.[0] / 1000000).format('MMM DD YYYY, hh:mm:ss a')}
            sx={{ marginTop: 0, marginLeft: 1 }}
            primaryTypographyProps={{ noWrap: true, sx: { fontSize: logsDateText } }}
          />
        </Box>
        <Tooltip title={rowItem?.[2] ? rowItem?.[2] : ''} placement={'left-end'}>
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
            wordWrap: 'break-word',
            alignSelf: 'center',
          }}
          primary={rowItem?.[1]}
        />
      </ListItem>
    );
  };

  return (
    <Virtuoso
      ref={listRef}
      style={{ height: '100%', width: '100%' }}
      totalCount={count}
      overscan={200}
      itemContent={(index) => <ListRow index={index} />}
    />
  );
};

export default LogsList;
