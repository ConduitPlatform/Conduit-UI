import React, { FC } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import DialogTitle from '@mui/material/DialogTitle';
import { Box, DialogContentText, IconButton, Typography } from '@mui/material';
import {IAdminSettings} from "@conduitplatform/conduit-ui/src/models/settings/SettingsModels";
import {IRouterConfig} from "@conduitplatform/conduit-ui/src/models/router/RouterModels";

interface Props {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  icon?: JSX.Element;
  baseUrl?: string;
  adminUrl?: string;
  transportsAdmin:  IAdminSettings['transports'];
  transportsRouter: IRouterConfig['transports'];
}

const GraphQLModal: FC<Props> = ({ open, setOpen, icon, title, baseUrl, adminUrl, transportsAdmin, transportsRouter }) => {
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
        <Box display="flex" justifyContent="space-between" alignItems={'center'}>
          <Box display="flex" alignItems={'center'}>
            {icon}
            <Typography variant="h6" sx={{ml: icon ? 1 : 0}}>{title} GraphQL</Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{ color: 'gray' }}
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
          {transportsRouter?.graphql ?
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ gap: 5 }}>
            <Typography>Go to App GraphQL: </Typography>
            <a
              style={{ textDecoration: 'none' }}
              href={`${baseUrl}/graphql`}
              target="_blank"
              rel="noreferrer">
              <Button variant="outlined">graphQL</Button>
            </a>
          </Box>
              :null}
          {transportsAdmin?.graphql ?
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ gap: 5 }}>
            <Typography>Go to Admin GraphQL: </Typography>
            <a
              style={{ textDecoration: 'none' }}
              href={`${adminUrl}/graphql`}
              target="_blank"
              rel="noreferrer">
              <Button variant="outlined">GraphQL</Button>
            </a>
          </Box>
              :null}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GraphQLModal;
