import React, { FC } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import DialogTitle from '@mui/material/DialogTitle';
import { Box, DialogContentText, IconButton, Typography } from '@mui/material';

interface Props {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  icon?: JSX.Element;
  graphQl: string;
  baseUrl?: string;
}

const GraphQLModal: FC<Props> = ({ open, setOpen, title, icon, graphQl, baseUrl }) => {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      keepMounted
      onClose={handleClose}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
      sx={{ padding: 10, overflowY: 'unset' }}>
      <DialogTitle id="alert-dialog-slide-title">
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">{title} GraphQL </Typography>
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: '1%', top: '1%', color: 'gray' }}
            size="large">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ minWidth: '400px' }}>
        <DialogContentText>
          GraphQL is used to describe and document RESTful APIs.
        </DialogContentText>
        <Box padding={5} display="flex" flexDirection={'column'} sx={{ gap: 5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ gap: 5 }}>
            <Typography>Go to {title} App GraphQL: </Typography>
            <a
              style={{ textDecoration: 'none' }}
              href={!graphQl ? `${baseUrl}/graphQL/` : `${baseUrl}/graphQL/#/${graphQl}`}
              target="_blank"
              rel="noreferrer">
              <Button variant="outlined">graphQL</Button>
            </a>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ gap: 5 }}>
            <Typography>Go to {title} Admin GraphQL: </Typography>
            <a
              style={{ textDecoration: 'none' }}
              href={
                !graphQl ? `${baseUrl}/admin/graphQL/` : `${baseUrl}/admin/graphQL/#/${graphQl}`
              }
              target="_blank"
              rel="noreferrer">
              <Button variant="outlined">GraphQL</Button>
            </a>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GraphQLModal;
