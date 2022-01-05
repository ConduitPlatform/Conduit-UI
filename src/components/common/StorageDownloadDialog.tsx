import React, { FC } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  image: {
    objectFit: 'contain',
    maxWidth: '1500px',
    maxHeight: '1000px',
  },
}));

interface DownloadDialogProps {
  fileUrl: string;
  fileName?: string;
  fileMimeType?: string;
}

const StorageDownloadDialog: FC<DownloadDialogProps & DialogProps> = ({
  fileName,
  fileUrl,
  fileMimeType,
  ...props
}) => {
  const classes = useStyles();

  const onClose = (e: React.MouseEvent<HTMLElement>) => {
    if (props?.onClose) props.onClose(e, 'backdropClick');
  };

  return (
    <Dialog {...props}>
      <DialogTitle>
        <Typography>{fileName ?? 'File Preview'}</Typography>
      </DialogTitle>
      <DialogContent>
        {fileMimeType?.includes('image') ? (
          <img
            className={classes.image}
            width={'100%'}
            height={'100%'}
            src={fileUrl}
            alt={'No available preview'}
          />
        ) : (
          <Typography>No available preview</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button href={fileUrl}>Download</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StorageDownloadDialog;
