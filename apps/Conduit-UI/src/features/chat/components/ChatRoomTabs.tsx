import React, { FC, forwardRef, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { useAppDispatch } from '../../../redux/store';
import { asyncAddChatRooms } from '../store/chatSlice';
import makeStyles from '@mui/styles/makeStyles';
import memoize from 'memoize-one';
import { IChatRoom } from '../models/ChatModels';
import ChatRoomTab, { ChatRoomTabSkeleton } from './ChatRoomTab';
import { Typography } from '@mui/material';
import { Components, ItemProps, Virtuoso } from 'react-virtuoso';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';

const useStyles = makeStyles((theme) => ({
  tabSelected: {
    background: theme.palette.mode === 'dark' ? '#202030' : theme.palette.primary.dark,
    width: '100%',
  },
  tabUnselected: {
    width: '100%',
  },
}));

const timeoutAmount = 750;

interface ListRowProps {
  index: number;
  data: {
    rooms: IChatRoom[];
    selectedTab: number;
    onPress: (index: number) => void;
    onLongPress: (index: number) => void;
  };
}

interface FooterListProps {
  dataLength: number;
  dataTotalCount: number;
}

const Row = ({ data, index }: ListRowProps) => {
  const { rooms, onPress, onLongPress, selectedTab } = data;
  const rowItem = rooms[index];
  const isSelected = selectedTab === index;
  const classes = useStyles();

  const getClassName = () => {
    if (isSelected) {
      return classes.tabSelected;
    }
    return classes.tabUnselected;
  };

  return (
    <>
      {!rowItem ? (
        <ChatRoomTabSkeleton />
      ) : (
        <ChatRoomTab
          onPress={() => onPress(index)}
          onLongPress={() => onLongPress(index)}
          data={rowItem}
          className={getClassName()}
          isSelected={isSelected}
        />
      )}
    </>
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
  return <Typography sx={{ textAlign: 'center', pt: 1 }}>No rooms</Typography>;
};

const FooterList = ({ dataLength, dataTotalCount }: FooterListProps) => {
  return dataTotalCount <= dataLength ? null : (
    <Typography sx={{ textAlign: 'center' }}>Loading...</Typography>
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
}

const ChatRoomTabs: FC<Props> = ({
  chatRooms,
  chatRoomCount,
  selectedTab,
  onPress,
  onLongPress,
  debouncedSearch,
}) => {
  const dispatch = useAppDispatch();
  const classes = useStyles();

  const addChatTabs = (skip: number, limit: number) => {
    const params = {
      skip: skip,
      limit: limit,
      search: debouncedSearch,
    };
    dispatch(asyncAddChatRooms(params));
  };

  const debouncedGetApiItems = debounce(
    (limit: number) => addChatTabs(chatRooms?.length, limit),
    timeoutAmount
  );

  const loadMoreItems = useCallback(
    (stopIndex: number) => {
      const limit = stopIndex + 1;
      debouncedGetApiItems(limit);
      return () => debouncedGetApiItems.cancel();
    },
    [debouncedGetApiItems]
  );

  const itemData = createItemData(chatRooms, onPress, onLongPress, selectedTab, classes);

  const endReached = useMemo(() => {
    if (chatRooms?.length === 0) return;
    return chatRooms?.length >= chatRoomCount ? undefined : loadMoreItems;
  }, [chatRoomCount, chatRooms?.length, loadMoreItems]);

  const MUIComponents: Components = useMemo(() => {
    return {
      List: MUIList,
      EmptyPlaceholder: EmptyList,
      Footer: () => FooterList({ dataLength: chatRooms?.length, dataTotalCount: chatRoomCount }),
      Item: ({ children, ...props }: ItemProps) => {
        return (
          <ListItem
            component="div"
            {...props}
            style={{ margin: 0, padding: 0, alignItems: 'stretch' }}
            disableGutters>
            {children}
          </ListItem>
        );
      },
    };
  }, [chatRoomCount, chatRooms?.length]);

  return (
    <Virtuoso
      data={chatRooms}
      endReached={endReached}
      itemContent={(index) => <Row data={itemData} index={index} />}
      components={MUIComponents}
      computeItemKey={(index, item) => `chatRoomTab-${item._id}${index}`}
    />
  );
};

export default ChatRoomTabs;
