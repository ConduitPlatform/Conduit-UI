import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

interface Props {
  open: boolean;
  buttonText: string;
  title?: string;
  description?: string;
  buttonAction: () => void;
  handleClose: () => void;
  showCancelButton?: boolean;
}

const ConfirmationDialog: React.FC<Props> = ({
  open,
  buttonText,
  title,
  description,
  buttonAction,
  handleClose,
  showCancelButton = true,
}) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {showCancelButton && (
          <Button onClick={handleClose} color="primary" variant="outlined">
            Cancel
          </Button>
        )}
        <Button onClick={buttonAction} color="primary" autoFocus>
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
