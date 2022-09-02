import React, { forwardRef, useMemo } from 'react';
import ListItem from '@mui/material/ListItem';
import memoize from 'memoize-one';
import { Components, ItemProps, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import ColorHash from 'color-hash';
import { LogsData } from '../../models/logs/LogsModels';
import List from '@mui/material/List';
import { Box, ListItemText, Tooltip } from '@mui/material';
import { logsDateText } from '../../theme';
import moment from 'moment';
import { Circle } from '@mui/icons-material';

interface Props {
  data: LogsData[];
}

interface ListRowProps {
  index: number;
}

const createItemData = memoize((logs, count) => ({
  logs,
  count,
}));

const LogsList = forwardRef<VirtuosoHandle, Props>((props, ref) => {
  const colorHash = new ColorHash();
  const { data } = props;

  const count = useMemo(() => {
    return data?.length;
  }, [data?.length]);

  const itemData = createItemData(data, count);

  const ListRow = ({ index }: ListRowProps) => {
    const { logs, count } = itemData;
    const rowItem = logs[count - index - 1];

    const handleBackgroundBubble = () => {
      return rowItem?.instance ? colorHash.hex(rowItem?.instance) : 'grey';
    };

    const handleBackgroundLabel = () => {
      switch (rowItem?.level) {
        case 'info':
          return 'green';
        case 'warn':
          return 'yellow';
        case 'error':
          return 'red';
        case 'debug':
          return 'blue';
        default:
          return 'grey';
      }
    };

    return (
      <>
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
      </>
    );
  };

  const MUIList: Components['List'] = forwardRef(({ children, style }, ref) => {
    return (
      <List style={{ padding: 0, ...style, margin: 0 }} component="div" ref={ref}>
        {children}
      </List>
    );
  });

  MUIList.displayName = 'MuiList';

  const MUIComponents: Components = {
    List: MUIList,

    Item: ({ children, ...props }: ItemProps) => {
      return (
        <ListItem
          component="div"
          {...props}
          style={{ margin: 0, alignItems: 'stretch' }}
          disableGutters>
          {children}
        </ListItem>
      );
    },
  };

  return (
    <Virtuoso
      ref={ref}
      style={{ flex: '1 1 auto', overscrollBehavior: 'contain' }}
      totalCount={count}
      overscan={20}
      itemContent={(index) => <ListRow index={index} />}
      followOutput={true}
      components={MUIComponents}
    />
  );
});

LogsList.displayName = 'LogsList';

export default LogsList;
