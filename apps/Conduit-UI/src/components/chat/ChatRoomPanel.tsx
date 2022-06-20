import React, { FC, useState } from 'react';
import Box from '@mui/material/Box';
import { BoxProps } from '@mui/material/Box/Box';
import { IChatRoom } from '../../models/chat/ChatModels';
import { asyncDeleteChatMessages } from '../../redux/slices/chatSlice';
import { useAppDispatch } from '../../redux/store';
import { IconButton, Paper, Typography } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatInfoDialog from './ChatInfoDialog';
import { ConfirmationDialog } from '@conduitplatform/ui-components';
import ChatRoomMessages from './ChatRoomMessages';

interface Props extends BoxProps {
  panelData: IChatRoom;
  selectedPanel: number;
}

const ChatRoomPanel: FC<Props> = ({ panelData, selectedPanel }) => {
  const dispatch = useAppDispatch();

  const [infoDialog, setInfoDialog] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);

  const handleCloseModal = () => {
    setInfoDialog(false);
  };

  const handleOpenModal = () => {
    setInfoDialog(true);
  };

  const onLongPress = (id: string) => {
    if (selected.includes(id)) return;
    const newSelected = [...selected, id];
    setSelected(newSelected);
  };

  const onPress = (id: string) => {
    if (selected.length < 1) return;
    const newSelected = [...selected];
    if (selected.includes(id)) {
      const itemIndex = selected.findIndex((selectedId) => selectedId === id);
      newSelected.splice(itemIndex, 1);
    } else {
      newSelected.push(id);
    }
    setSelected(newSelected);
  };

  const onDeletePress = () => {
    setDeleteDialog(true);
  };

  const handleDelete = () => {
    dispatch(asyncDeleteChatMessages({ ids: selected }));
    setDeleteDialog(false);
    setSelected([]);
  };

  const handleClose = () => {
    setDeleteDialog(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Paper
        sx={{
          paddingX: 1,
          backgroundColor: 'secondary.dark',
          marginLeft: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          borderRadius: 2,
        }}
        elevation={6}>
        <Typography sx={{ display: 'flex', flex: 1 }}>{panelData.name}</Typography>
        <Box>
          {selected.length > 0 ? (
            <IconButton sx={{ padding: 1 }} onClick={() => onDeletePress()} size="large">
              <DeleteIcon />
            </IconButton>
          ) : (
            <IconButton sx={{ padding: 1 }} onClick={() => handleOpenModal()} size="large">
              <InfoOutlined />
            </IconButton>
          )}
        </Box>
        {selected.length > 0 && (
          <Box
            sx={{
              backgroundColor: 'gray',
              borderRadius: 2,
              padding: '4px',
            }}>
            <Typography variant={'subtitle2'}>{selected.length} selected</Typography>
          </Box>
        )}
      </Paper>
      <Box sx={{ flex: 1, pt: 2, pl: 2 }}>
        <ChatRoomMessages
          roomId={panelData._id}
          selectedPanel={selectedPanel}
          selectedMessages={selected}
          onPress={onPress}
          onLongPress={onLongPress}
        />
      </Box>
      <ChatInfoDialog data={panelData} open={infoDialog} onClose={handleCloseModal} />
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={handleClose}
        title="Delete messages"
        description="Are you sure you want to delete the selected messages?"
        buttonAction={handleDelete}
        buttonText={'Delete'}
      />
    </Box>
  );
};

export default ChatRoomPanel;
