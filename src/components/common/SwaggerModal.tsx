import React, { FC } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';

import DialogContent from '@material-ui/core/DialogContent';
import CloseIcon from '@material-ui/icons/Close';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Box, DialogContentText, IconButton, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import axios from 'axios';

interface Props {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  icon?: JSX.Element;
  swagger: string;
}

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 6,
    alignItems: 'center',
    justifyContent: 'center',
    justifyItems: 'center',
    justifySelf: 'center',
  },
  textField: {
    textAlign: 'center',
  },
  customizedButton: {
    position: 'absolute',
    left: '90%',
    top: '1%',
    color: 'gray',
  },
}));

const SwaggerModal: FC<Props> = ({ open, setOpen, title, icon, swagger }) => {
  const classes = useStyles();

  const handleClose = () => {
    setOpen(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = 'conduitSwagger.json';
    axios
      .get('https://conduit-core.dev.quintessential.gr/swagger.json', {
        responseType: 'blob',
      })
      .then((res) => {
        link.href = URL.createObjectURL(new Blob([res.data], { type: 'application/json' }));
        link.click();
      });
  };

  const handleAdminDownload = () => {
    const link = document.createElement('a');
    link.download = 'conduitAdminSwagger.json';
    axios
      .get('https://conduit-core.dev.quintessential.gr/admin/swagger.json', {
        responseType: 'blob',
      })
      .then((res) => {
        link.href = URL.createObjectURL(new Blob([res.data], { type: 'application/json' }));
        link.click();
      });
  };

  return (
    <Dialog
      open={open}
      keepMounted
      onClose={handleClose}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
      style={{ padding: 40 }}>
      <DialogTitle id="alert-dialog-slide-title">
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">{title} Swagger </Typography>
          <IconButton onClick={handleClose} className={classes.customizedButton}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent style={{ minWidth: '500px' }}>
        <DialogContentText>
          Swagger is used to describe and document RESTful APIs.
        </DialogContentText>
        <Box padding={5} display="flex" flexDirection={'column'} style={{ gap: 10 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            style={{ gap: 14 }}>
            <Typography>Go to {title} Swagger: </Typography>
            <a
              style={{ textDecoration: 'none' }}
              href={
                !swagger
                  ? `${process.env.CONDUIT_URL}/swagger/`
                  : `${process.env.CONDUIT_URL}/swagger/#/${swagger}`
              }
              target="_blank"
              rel="noreferrer">
              <Button variant="outlined" endIcon={icon}>
                Swagger
              </Button>
            </a>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            style={{ gap: 14 }}>
            <Typography>Go to {title} Admin Swagger: </Typography>
            <a
              style={{ textDecoration: 'none' }}
              href={
                !swagger
                  ? `${process.env.CONDUIT_URL}/admin/swagger/`
                  : `${process.env.CONDUIT_URL}/admin/swagger/#/${swagger}`
              }
              target="_blank"
              rel="noreferrer">
              <Button variant="outlined" endIcon={icon}>
                Swagger
              </Button>
            </a>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            style={{ gap: 14 }}>
            <Typography>Download App Swagger: </Typography>
            <Button variant="outlined" onClick={handleDownload}>
              Download Json
            </Button>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            style={{ gap: 14 }}>
            <Typography>Download Admin Swagger: </Typography>
            <Button variant="outlined" onClick={handleAdminDownload}>
              Download Json
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SwaggerModal;
