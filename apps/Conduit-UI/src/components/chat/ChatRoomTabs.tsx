import React, { CSSProperties, FC, useCallback, useEffect, useRef } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { debounce } from 'lodash';
import { useAppDispatch } from '../../redux/store';
import { asyncGetChatRooms } from '../../redux/slices/chatSlice';
import makeStyles from '@mui/styles/makeStyles';
import memoize from 'memoize-one';
import { IChatRoom } from '../../models/chat/ChatModels';
import ChatRoomTab, { ChatRoomTabSkeleton } from './ChatRoomTab';
import { styled, Typography } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  tabSelected: {
    backgroundColor: `${theme.palette.grey[700]}80`,
  },
}));

const CustomizedList = styled(List)(() => ({
  scrollbarWidth: 'thin',
  scrollbarColor: 'transparent transparent',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'transparent',
  },
}));

const timeoutAmount = 750;

const Row = ({ data, index, style }: ListChildComponentProps) => {
  const { rooms, onPress, onLongPress, selectedTab, classes } = data;
  const rowItem = rooms[index];
  const isSelected = selectedTab === index;

  const getClassName = () => {
    if (isSelected) {
      return classes.tabSelected;
    }
  };

  return (
    <div style={style as CSSProperties}>
      {!rowItem ? (
        <ChatRoomTabSkeleton />
      ) : (
        <ChatRoomTab
          onPress={() => onPress(index)}
          onLongPress={() => onLongPress(index)}
          data={rowItem}
          className={getClassName()}
        />
      )}
    </div>
  );
};

const createItemData = memoize((rooms, onPress, onLongPress, selectedTab, classes) => ({
  rooms,
  onPress,
  onLongPress,
  selectedTab,
  classes,
}));

interface Props {
  chatRooms: IChatRoom[];
  chatRoomCount: number;
  selectedTab: number;
  onPress: (index: number) => void;
  onLongPress: (index: number) => void;
  debouncedSearch: string;
  areEmpty: boolean;
}

const ChatRoomTabs: FC<Props> = ({
  chatRooms,
  chatRoomCount,
  selectedTab,
  onPress,
  onLongPress,
  debouncedSearch,
  areEmpty,
}) => {
  const dispatch = useAppDispatch();
  const classes = useStyles();

  const infiniteLoaderRef = useRef<any>(null);
  const hasMountedRef = useRef(false);

  const isItemLoaded = (index: number) => !!chatRooms[index];

  useEffect(() => {
    if (infiniteLoaderRef.current && hasMountedRef.current) {
      infiniteLoaderRef.current.resetloadMoreItemsCache();
    }
    hasMountedRef.current = true;
  }, [debouncedSearch]);

  const getChatRooms = useCallback(
    (skip: number, limit: number) => {
      const params = {
        skip: skip,
        limit: limit,
        search: debouncedSearch,
      };
      dispatch(asyncGetChatRooms(params));
    },
    [debouncedSearch, dispatch]
  );

  const debouncedGetApiItems = debounce(
    (skip: number, limit: number) => getChatRooms(skip, limit),
    timeoutAmount
  );

  const loadMoreItems = async (startIndex: number, stopIndex: number) => {
    const limit = stopIndex + 1;
    debouncedGetApiItems(chatRooms.length, limit);
  };

  const itemData = createItemData(chatRooms, onPress, onLongPress, selectedTab, classes);

  return (
    <AutoSizer>
      {({ height, width }) => {
        if (!chatRoomCount) {
          if (areEmpty)
            return <Typography sx={{ whiteSpace: 'nowrap' }}>No available Rooms</Typography>;
          return <></>;
        }
        return (
          <InfiniteLoader
            ref={infiniteLoaderRef}
            isItemLoaded={isItemLoaded}
            itemCount={chatRoomCount}
            loadMoreItems={loadMoreItems}
            threshold={4}>
            {({ onItemsRendered, ref }) => {
              return (
                <CustomizedList
                  height={height}
                  itemCount={chatRoomCount}
                  itemSize={40}
                  onItemsRendered={onItemsRendered}
                  ref={ref}
                  itemData={itemData}
                  width={width}>
                  {Row}
                </CustomizedList>
              );
            }}
          </InfiniteLoader>
        );
      }}
    </AutoSizer>
  );
};

export default ChatRoomTabs;
