import React, { FC } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import CloseIcon from "@mui/icons-material/Close";
import DialogTitle from "@mui/material/DialogTitle";
import { Box, DialogContentText, IconButton, Typography } from "@mui/material";
import axios from "axios";
import {IAdminSettings} from "@conduitplatform/conduit-ui/src/models/settings/SettingsModels";
import {ISecurityConfig} from "@conduitplatform/conduit-ui/src/models/security/SecurityModels";

interface Props {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  swagger?: string;
  baseUrl: string;
  transportsAdmin: IAdminSettings['transports'];
  transportsRouter: ISecurityConfig['transports'];
}

const SwaggerModal: FC<Props> = ({
  open,
  setOpen,
  title,
  swagger,
  baseUrl,
  transportsAdmin,
   transportsRouter
}) => {
  const handleClose = () => {
    setOpen(false);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = "conduitSwagger.json";
    axios
      .get(`${baseUrl}/swagger.json`, {
        responseType: "blob",
      })
      .then((res) => {
        link.href = URL.createObjectURL(
          new Blob([res.data], { type: "application/json" })
        );
        link.click();
      });
  };

  const handleAdminDownload = () => {
    const link = document.createElement("a");
    link.download = "conduitAdminSwagger.json";
    axios
      .get(`${baseUrl}/admin/swagger.json`, {
        responseType: "blob",
      })
      .then((res) => {
        link.href = URL.createObjectURL(
          new Blob([res.data], { type: "application/json" })
        );
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
      sx={{ padding: 10, overflowY: 'unset' }}
    >
      <DialogTitle id="alert-dialog-slide-title">
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">{title} Swagger </Typography>
          <IconButton
            onClick={handleClose}
            sx={{ position: "absolute", right: "1%", top: "1%", color: "gray" }}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ minWidth: "400px" }}>
        <DialogContentText>
          Swagger is used to describe and document RESTful APIs.
        </DialogContentText>
        <Box
          padding={5}
          display="flex"
          flexDirection={"column"}
          sx={{ gap: 5 }}
        >
          {transportsRouter?.rest ?
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ gap: 5 }}
          >
            <Typography>Go to {title} {title.toLowerCase() != 'app' ? 'App' : ''} Swagger: </Typography>
            <a
              style={{ textDecoration: "none" }}
              href={
                !swagger
                  ? `${baseUrl}/swagger/`
                  : `${baseUrl}/swagger/#/${swagger}`
              }
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outlined">Swagger</Button>
            </a>
          </Box>
              :null}
          {transportsAdmin?.rest ?
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ gap: 5 }}
          >
            <Typography>Go to {title} Admin Swagger: </Typography>
            <a
              style={{ textDecoration: "none" }}
              href={
                !swagger
                  ? `${baseUrl}/admin/swagger/`
                  : `${baseUrl}/admin/swagger/#/${swagger}`
              }
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outlined">Swagger</Button>
            </a>
          </Box>
              : null}
          {transportsRouter?.rest ?
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ gap: 5 }}
          >
            <Typography>Download App Swagger: </Typography>
            <Button variant="outlined" onClick={handleDownload}>
              Download Json
            </Button>
          </Box>
              :null}
          {transportsAdmin?.rest ?
              <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ gap: 5 }}
          >
            <Typography>Download Admin Swagger: </Typography>
            <Button variant="outlined" onClick={handleAdminDownload}>
              Download Json
            </Button>
          </Box>
              :null}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SwaggerModal;
