import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, InputAdornment, Paper, TextField } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import {
  asyncGetChatRooms,
  asyncPostCreateChatRoom,
  clearChatMessages,
} from '../../redux/slices/chatSlice';
import ChatRoomPanel from './ChatRoomPanel';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import CreateChatRoomDrawer from './CreateChatRoomDrawer';
import useDebounce from '../../hooks/useDebounce';
import ChatRoomTabs from './ChatRoomTabs';
import { AuthUserUI } from '../../models/authentication/AuthModels';
import { Search } from '@mui/icons-material';
import { IChatRoom } from '../../models/chat/ChatModels';

const ChatRooms: React.FC = () => {
  const dispatch = useAppDispatch();

  const {
    chatRooms: { data, count },
  } = useAppSelector((state) => state.chatSlice.data);

  const [selected, setSelected] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const debouncedSearch: string = useDebounce(search, 500);

  const getChatRooms = useCallback(() => {
    const params = { skip: 0, limit: 20, search: debouncedSearch };
    dispatch(asyncGetChatRooms(params));
  }, [debouncedSearch, dispatch]);

  useEffect(() => {
    getChatRooms();
  }, [getChatRooms]);

  const handleCreateChatRoom = (inputData: { name: string; participants: AuthUserUI[] }) => {
    const participantIds = inputData.participants.map((participant) => participant._id);

    const params = {
      name: inputData.name,
      participants: participantIds,
      getChatRooms: getChatRooms,
    };
    dispatch(asyncPostCreateChatRoom(params));
    setDrawerOpen(false);
  };

  const onPress = (index: number) => {
    if (index === selected) return;
    setSelected(index);
    dispatch(clearChatMessages());
  };

  const onLongPress = (index: number) => {
    console.log('onLongPress', index);
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          height: '80vh',
          padding: 2,
          borderRadius: 4,
          backgroundColor: 'rgba(0,0,0,0.05)',
        }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: 220 }}>
          <TextField
            size={'small'}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 2,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            label={'Search'}
            variant={'outlined'}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
            }}>
            <ChatRoomTabs
              chatRooms={data}
              chatRoomCount={count}
              onPress={onPress}
              onLongPress={onLongPress}
              selectedTab={selected}
              debouncedSearch={debouncedSearch}
            />
          </Box>
          <Button
            sx={{ whiteSpace: 'nowrap', mt: 1 }}
            variant="contained"
            fullWidth
            color="primary"
            startIcon={<AddCircleOutline />}
            onClick={() => setDrawerOpen(true)}>
            Create chat room
          </Button>
        </Box>
        {data.map((item: IChatRoom, index: number) => {
          if (index === selected) {
            return <ChatRoomPanel panelData={item} key={index} />;
          }
        })}
      </Paper>

      <CreateChatRoomDrawer
        open={drawerOpen}
        handleCreateChatRoom={handleCreateChatRoom}
        closeDrawer={() => setDrawerOpen(false)}
      />
    </>
  );
};

export default ChatRooms;
