import React, { FC } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import DialogTitle from '@mui/material/DialogTitle';
import { Box, DialogContentText, IconButton, Typography } from '@mui/material';
import {IAdminSettings} from "@conduitplatform/conduit-ui/src/models/settings/SettingsModels";
import {ISecurityConfig} from "@conduitplatform/conduit-ui/src/models/security/SecurityModels";

interface Props {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  graphQl?: string;
  baseUrl?: string;
  transportsAdmin:  IAdminSettings['transports'];
  transportsRouter: ISecurityConfig['transports'];
}

const GraphQLModal: FC<Props> = ({ open, setOpen, title, graphQl, baseUrl, transportsAdmin, transportsRouter }) => {
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
          {transportsRouter?.graphql ?
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ gap: 5 }}>
            <Typography>Go to {title} {title.toLowerCase() != 'app' ? 'App' : ''} GraphQL: </Typography>
            <a
              style={{ textDecoration: 'none' }}
              href={!graphQl ? `${baseUrl}/graphQL/` : `${baseUrl}/graphQL/#/${graphQl}`}
              target="_blank"
              rel="noreferrer">
              <Button variant="outlined">graphQL</Button>
            </a>
          </Box>
              :null}
          {transportsAdmin?.graphql ?
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
              :null}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GraphQLModal;
