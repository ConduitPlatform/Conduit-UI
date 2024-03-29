import React, { FC, forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { asyncGetChatMessages } from '../store/chatSlice';
import makeStyles from '@mui/styles/makeStyles';
import memoize from 'memoize-one';
import ChatRoomBubble, { ChatRoomBubbleSkeleton } from './ChatRoomBubble';
import clsx from 'clsx';
import { Typography } from '@mui/material';
import { Components, ItemProps, Virtuoso } from 'react-virtuoso';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { IChatMessage } from '../models/ChatModels';
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles<Theme>((theme) => ({
  bubble: {
    margin: '2px 0px 2px 0px',
    padding: theme.spacing(1, 1),
    borderRadius: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    color: 'white',
  },
  bubbleSelected: {
    backgroundColor: `${theme.palette.grey[700]}80`,
    width: '100%',
  },
}));

const MUIList: Components['List'] = forwardRef(({ children, style }, ref) => {
  return (
    <List
      style={{
        padding: 0,
        margin: 0,
        ...style,
      }}
      component="div"
      ref={ref}>
      {children}
    </List>
  );
});

MUIList.displayName = 'MuiList';

const EmptyList: Components['EmptyPlaceholder'] = () => {
  return <Typography sx={{ textAlign: 'center', pt: 1 }}>No messages</Typography>;
};

interface HeaderListProps {
  dataLength: number;
  dataTotalCount: number;
}

const HeaderList = ({ dataLength, dataTotalCount }: HeaderListProps) => {
  return dataTotalCount <= dataLength ? null : (
    <Typography sx={{ textAlign: 'center' }}>Loading...</Typography>
  );
};

const createItemData = memoize((selectedMessages, onPress, onLongPress) => ({
  selectedMessages,
  onPress,
  onLongPress,
}));

interface ListRowProps {
  message: IChatMessage;
  itemData: {
    selectedMessages: string[];
    onPress: (id: string) => void;
    onLongPress: (id: string) => void;
  };
}

const Row = ({ message, itemData }: ListRowProps) => {
  const { selectedMessages, onPress, onLongPress } = itemData;
  const isSelected = message?.message && selectedMessages.includes(message?._id);
  const classes = useStyles();

  const getClassName = () => {
    if (isSelected) {
      return clsx(classes.bubble, classes.bubbleSelected);
    }
    return classes.bubble;
  };

  return (
    <>
      {!message ? (
        <ChatRoomBubbleSkeleton className={classes.bubble} />
      ) : (
        <ChatRoomBubble
          data={message}
          className={getClassName()}
          onLongPress={onLongPress}
          onPress={onPress}
        />
      )}
    </>
  );
};

interface Props {
  roomId: string;
  selectedMessages: string[];
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
}

const START_INDEX = 500;
const INITIAL_ITEM_COUNT = 20;
const topMostItem = INITIAL_ITEM_COUNT - 1;

const timeoutAmount = 300;

const ChatRoomMessages: FC<Props> = ({ roomId, selectedMessages, onPress, onLongPress }) => {
  const dispatch = useAppDispatch();
  const {
    chatMessages: { data, count },
  } = useAppSelector((state) => state.chatSlice.data);
  const [firstItemIndex, setFirstItemIndex] = useState<number>(START_INDEX);
  const [messages, setMessages] = useState<IChatMessage[]>([]);

  useEffect(() => {
    const reversedArray = [...data].reverse();
    setMessages(reversedArray);
  }, [data]);

  useEffect(() => {
    const nextFirstItemIndex = firstItemIndex - 20;
    setFirstItemIndex(nextFirstItemIndex);
  }, [data]);

  const itemData = createItemData(selectedMessages, onPress, onLongPress);

  const getChatMessages = useCallback(
    (skip: number, limit: number) => {
      const params = {
        skip: skip,
        limit: limit,
        roomId: roomId,
        sort: '-createdAt',
      };
      dispatch(asyncGetChatMessages(params));
    },
    [dispatch, roomId]
  );

  useEffect(() => {
    getChatMessages(0, 20);
  }, [getChatMessages]);

  const debouncedGetApiItems = debounce(() => getChatMessages(data?.length, 20), timeoutAmount);

  const prependItems = useCallback(() => {
    debouncedGetApiItems();
    return () => debouncedGetApiItems.cancel();
  }, [debouncedGetApiItems]);

  const startReached = useMemo(() => {
    if (!data?.length) return;
    return data?.length >= count ? undefined : prependItems;
  }, [count, data?.length, prependItems]);

  const MUIComponents: Components = useMemo(() => {
    return {
      List: MUIList,
      EmptyPlaceholder: EmptyList,
      Header: () => HeaderList({ dataLength: data?.length, dataTotalCount: count }),
      Item: ({ children, ...props }: ItemProps) => {
        return (
          <ListItem
            component="div"
            {...props}
            style={{ margin: 0, alignItems: 'stretch' }}
            disablePadding>
            {children}
          </ListItem>
        );
      },
    };
  }, [count, data?.length]);

  return (
    <Virtuoso
      firstItemIndex={firstItemIndex}
      initialTopMostItemIndex={topMostItem}
      data={messages}
      startReached={startReached}
      itemContent={(index, message) => <Row message={message} itemData={itemData} />}
      components={MUIComponents}
      computeItemKey={(index, item) => `bubble-${item._id}${index}`}
    />
  );
};

export default ChatRoomMessages;
