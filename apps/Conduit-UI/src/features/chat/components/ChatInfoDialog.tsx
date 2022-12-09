import { Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import moment from 'moment';
import Box from '@mui/material/Box';
import React, { FC } from 'react';
import { IChatRoom } from '../models/ChatModels';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  data: IChatRoom;
  open: boolean;
  onClose: () => void;
}

const ChatInfoDialog: FC<Props> = ({ data, open, onClose }) => {
  return (
    <Dialog onClose={onClose} open={open} fullWidth maxWidth="xs">
      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', left: '90%', top: '1%', color: 'gray' }}
        size="medium">
        <CloseIcon />
      </IconButton>
      <DialogTitle>Info</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 1 }}>
          id: {data._id}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Name: {data.name}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Created at: {moment(data.createdAt).format('MMM Do YYYY, h:mm:ss a')}
        </Typography>
        <Box>
          <Typography variant="body1">Participants:</Typography>
          {data.participants.map((participant, index) => {
            return (
              <Typography variant={'body2'} key={index}>
                {participant.email}
              </Typography>
            );
          })}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChatInfoDialog;
