import React, { FC, forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { asyncGetChatMessages } from '../../redux/slices/chatSlice';
import makeStyles from '@mui/styles/makeStyles';
import memoize from 'memoize-one';
import ChatRoomBubble, { ChatRoomBubbleSkeleton } from './ChatRoomBubble';
import clsx from 'clsx';
import { Typography } from '@mui/material';
import { Components, ItemProps, Virtuoso } from 'react-virtuoso';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

const useStyles = makeStyles((theme) => ({
  bubble: {
    marginBottom: theme.spacing(0.5),
    padding: theme.spacing(1, 1),
    borderRadius: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
  },
  bubbleSelected: {
    backgroundColor: `${theme.palette.grey[700]}80`,
  },
}));

const timeoutAmount = 750;

const createItemData = memoize(
  (messages, messagesCount, selectedMessages, onPress, onLongPress, classes) => ({
    messages,
    messagesCount,
    selectedMessages,
    onPress,
    onLongPress,
    classes,
  })
);

interface Props {
  roomId: string;
  selectedPanel: number;
  selectedMessages: string[];
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
}

const START_INDEX = 500;
const INITIAL_ITEM_COUNT = 20;

const ChatRoomMessages: FC<Props> = ({
  roomId,
  selectedPanel,
  selectedMessages,
  onPress,
  onLongPress,
}) => {
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const {
    chatMessages: { data, count },
  } = useAppSelector((state) => state.chatSlice.data);

  const infiniteLoaderRef = useRef<any>(null);
  const hasMountedRef = useRef(false);
  const [firstItemIndex, setFirstItemIndex] = useState<number>(START_INDEX);
  const [messages, setMessages] = useState(data);

  useEffect(() => {
    const reversedArray = [...data].reverse();
    setMessages(reversedArray);
  }, [data]);

  useEffect(() => {
    if (infiniteLoaderRef.current && hasMountedRef.current) {
      infiniteLoaderRef.current.resetloadMoreItemsCache();
    }
    hasMountedRef.current = true;
  }, [selectedPanel, count]);

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

  const debouncedGetApiItems = debounce(
    (skip: number, limit: number) => getChatMessages(skip, limit),
    timeoutAmount
  );

  const loadMoreItems = async () => {
    debouncedGetApiItems(data?.length, 20);
  };

  const itemData = createItemData(data, count, selectedMessages, onPress, onLongPress, classes);

  const prependItems = useCallback(() => {
    const usersToPrepend = 20;
    const nextFirstItemIndex = firstItemIndex - usersToPrepend;

    setTimeout(() => {
      setFirstItemIndex(() => nextFirstItemIndex);
      loadMoreItems();
    }, 500);

    return false;
  }, [firstItemIndex, loadMoreItems]);

  const Row = ({ index, message }: any) => {
    // const { selectedMessages, onPress, onLongPress, classes } = itemData;
    const isSelected = message.message && selectedMessages.includes(message._id);

    const getClassName = () => {
      if (isSelected) {
        return clsx(classes.bubble, classes.bubbleSelected);
      }
      return classes.bubble;
    };

    return (
      <div>
        {!message ? (
          <ChatRoomBubbleSkeleton className={classes.bubble} />
        ) : (
          <div id={`bubble-${index}`}>
            <ChatRoomBubble
              data={message}
              className={getClassName()}
              onLongPress={onLongPress}
              onPress={onPress}
            />
          </div>
        )}
      </div>
    );
  };

  const MUIList: Components['List'] = forwardRef(({ children, style }, ref) => {
    return (
      <List
        style={{
          padding: 0,
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
      style={{ height: '300px' }}
      firstItemIndex={Math.max(0, firstItemIndex)}
      initialTopMostItemIndex={INITIAL_ITEM_COUNT - 1}
      data={messages}
      startReached={data?.length >= count ? undefined : prependItems}
      itemContent={(index, message) => <Row index={index} message={message} />}
      components={MUIComponents}
      overscan={100}
    />
  );
};

export default ChatRoomMessages;
