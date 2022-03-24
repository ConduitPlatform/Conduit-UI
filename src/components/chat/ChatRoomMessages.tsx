import React, { CSSProperties, FC, useCallback, useEffect, useRef } from 'react';
import { ListChildComponentProps, VariableSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { debounce } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { asyncGetChatMessages } from '../../redux/slices/chatSlice';
import makeStyles from '@mui/styles/makeStyles';
import memoize from 'memoize-one';
import ChatRoomBubble, { ChatRoomBubbleSkeleton } from './ChatRoomBubble';
import clsx from 'clsx';
import { Typography } from '@mui/material';

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

const Row = ({ data, index, style }: ListChildComponentProps) => {
  const { messages, messagesCount, selectedMessages, onPress, onLongPress, setRowHeight, classes } =
    data;
  const rowItem = messages[messagesCount - index - 1];
  const isSelected = rowItem && selectedMessages.includes(rowItem._id);

  const rowRef = useRef<any>({});

  useEffect(() => {
    if (rowRef.current) {
      setRowHeight(index, rowRef.current.clientHeight);
    }
  }, [rowRef]);

  const getClassName = () => {
    if (isSelected) {
      return clsx(classes.bubble, classes.bubbleSelected);
    }
    return classes.bubble;
  };

  return (
    <div style={style as CSSProperties}>
      {!rowItem ? (
        <ChatRoomBubbleSkeleton className={classes.bubble} />
      ) : (
        <div ref={rowRef} id={`bubble-${index}`}>
          <ChatRoomBubble
            data={rowItem}
            className={getClassName()}
            onLongPress={onLongPress}
            onPress={onPress}
          />
        </div>
      )}
    </div>
  );
};

const createItemData = memoize(
  (messages, messagesCount, selectedMessages, onPress, onLongPress, classes, setRowHeight) => ({
    messages,
    messagesCount,
    selectedMessages,
    onPress,
    onLongPress,
    classes,
    setRowHeight,
  })
);

interface Props {
  roomId: string;
  selectedPanel: number;
  selectedMessages: string[];
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
}

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
    chatMessages: { data, count, areEmpty },
  } = useAppSelector((state) => state.chatSlice.data);

  const infiniteLoaderRef = useRef<any>(null);
  const hasMountedRef = useRef(false);
  const rowHeights = useRef<any>({});

  const getRowHeight = (index: number) => {
    return rowHeights.current[index] + 8 || 56;
  };

  const setRowHeight = (index: number, size: number) => {
    // infiniteLoaderRef.current._listRef.resetAfterIndex(0);
    rowHeights.current = { ...rowHeights.current, [index]: size };
  };

  const isItemLoaded = (index: number) => {
    return !!data[count - index - 1];
  };

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

  const loadMoreItems = async (startIndex: number) => {
    const limit = count - startIndex - data.length;
    debouncedGetApiItems(data.length, limit);
  };

  const itemData = createItemData(
    data,
    count,
    selectedMessages,
    onPress,
    onLongPress,
    classes,
    setRowHeight
  );

  return (
    <AutoSizer>
      {({ height, width }) => {
        if (!count) {
          if (areEmpty)
            return (
              <Typography sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                No available messages
              </Typography>
            );
          return <></>;
        }
        return (
          <InfiniteLoader
            ref={infiniteLoaderRef}
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
                  onItemsRendered={onItemsRendered}
                  ref={ref}
                  initialScrollOffset={count * 500}
                  itemData={itemData}
                  width={width}>
                  {Row}
                </List>
              );
            }}
          </InfiniteLoader>
        );
      }}
    </AutoSizer>
  );
};

export default ChatRoomMessages;
