import React, { CSSProperties, forwardRef, useMemo } from 'react';
import ListItem from '@mui/material/ListItem';
import memoize from 'memoize-one';
import { Components, ItemProps, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import ColorHash from 'color-hash';
import { LogsData } from '../../models/logs/LogsModels';
import List from '@mui/material/List';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ListItemText,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import moment from 'moment';
import { Circle } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import JsonEditorComponent from '../common/JsonEditorComponent';

interface MessageItemProps {
  message?: string;
  rowItem: LogsData;
  handleBackgroundBubble: () => CSSProperties | string;
  logsDateText: CSSProperties;
  handleBackgroundLabel: () => string;
}

const MessageItem = ({
  message,
  rowItem,
  handleBackgroundBubble,
  logsDateText,
  handleBackgroundLabel,
}: MessageItemProps) => {
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
        primary={message ? message : rowItem?.message}
      />
    </>
  );
};

interface MessageItemAccordionProps {
  expandable: {
    mainMessage: string;
    metaData?: string;
    expanded?: boolean;
    setExpanded?: () => void;
  };
  rowItem: LogsData;
  handleBackgroundBubble: () => CSSProperties | string;
  logsDateText: CSSProperties;
  handleBackgroundLabel: () => string;
}

const MessageItemAccordion = ({
  expandable,
  rowItem,
  handleBackgroundBubble,
  logsDateText,
  handleBackgroundLabel,
}: MessageItemAccordionProps) => {
  return (
    <Accordion
      expanded={expandable?.expanded}
      onChange={expandable?.setExpanded}
      elevation={0}
      disableGutters
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        padding: 0,
        '&.MuiAccordion-gutters': {
          padding: 0,
          margin: 0,
        },
      }}>
      <AccordionSummary
        sx={{
          '&.MuiAccordionSummary-root': { minHeight: 'unset', justifyContent: 'flex-start' },
          '.MuiAccordionSummary-content': {
            margin: 0,
            padding: 0,
            flexGrow: 0,
          },
          padding: 0,
          '.MuiAccordionSummary-expandIconWrapper': { marginLeft: 1 },
        }}
        expandIcon={<ExpandMoreIcon color={'disabled'} />}
        aria-controls="panel2a-content"
        id="panel2a-header">
        {MessageItem({
          message: expandable?.mainMessage,
          rowItem: rowItem,
          handleBackgroundBubble: handleBackgroundBubble,
          logsDateText: logsDateText,
          handleBackgroundLabel: handleBackgroundLabel,
        })}
      </AccordionSummary>
      <AccordionDetails>
        <JsonEditorComponent
          placeholder={expandable?.metaData}
          viewOnly
          height="100%"
          width="100%"
          confirmGood={false}
        />
      </AccordionDetails>
    </Accordion>
  );
};

interface Props {
  data: LogsData[];
  expandedMessages: number[];
  setExpandedMessages: (itemIndex: number) => void;
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
  const { data, expandedMessages, setExpandedMessages } = props;
  const theme = useTheme();

  const logsDateText = {
    fontSize: '1rem',
    [theme.breakpoints.down('lg')]: {
      fontSize: '0.8rem',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.6rem',
    },
  };

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
          return 'gray';
      }
    };

    const expandable: MessageItemAccordionProps['expandable'] = useMemo(() => {
      const mainMessage = rowItem?.message.slice(0, rowItem?.message?.indexOf('{"'));
      const metaData = rowItem?.message?.slice(rowItem?.message?.indexOf('{"'));
      const expanded = expandedMessages?.includes(index);
      const setExpanded = () => setExpandedMessages(index);

      try {
        const parsed = JSON.parse(metaData);
        return {
          mainMessage: mainMessage,
          metaData: parsed,
          expanded: expanded,
          setExpanded: setExpanded,
        };
      } catch {
        return {
          mainMessage: mainMessage,
        };
      }
    }, [index, rowItem?.message]);

    return expandable?.metaData
      ? MessageItemAccordion({
          expandable: expandable,
          rowItem: rowItem,
          handleBackgroundBubble: handleBackgroundBubble,
          logsDateText: logsDateText,
          handleBackgroundLabel: handleBackgroundLabel,
        })
      : MessageItem({
          rowItem: rowItem,
          handleBackgroundBubble: handleBackgroundBubble,
          logsDateText: logsDateText,
          handleBackgroundLabel: handleBackgroundLabel,
        });
  };

  const MUIList: Components['List'] = forwardRef(({ children, style }, ref) => {
    return (
      <List style={{ padding: 0, ...style, margin: 0 }} component="div" ref={ref}>
        {children}
      </List>
    );
  });

  MUIList.displayName = 'MuiList';

  const EmptyList: Components['EmptyPlaceholder'] = () => {
    return <Typography sx={{ textAlign: 'center', pt: 1 }}>No logs</Typography>;
  };

  const MUIComponents: Components = {
    List: MUIList,
    EmptyPlaceholder: EmptyList,
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
      overscan={100}
      itemContent={(index) => <ListRow index={index} />}
      followOutput={true}
      components={MUIComponents}
      computeItemKey={(index, item) => `log-${item?.timestamp}${index}`}
    />
  );
});

LogsList.displayName = 'LogsList';

export default LogsList;
