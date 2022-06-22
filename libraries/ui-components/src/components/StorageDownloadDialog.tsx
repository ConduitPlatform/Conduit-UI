import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";

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
  const [imgLoading, setImgLoading] = useState(false);

  useEffect(() => {
    if (fileMimeType?.includes("image")) setImgLoading(true);
  }, [fileMimeType, fileUrl]);

  const onClose = (e: React.MouseEvent<HTMLElement>) => {
    if (props?.onClose) props.onClose(e, "backdropClick");
  };

  return (
    <Dialog {...props}>
      <DialogTitle>
        <Typography>{fileName ?? "File Preview"}</Typography>
      </DialogTitle>
      <DialogContent>
        {fileMimeType?.includes("image") ? (
          <img
            style={{
              objectFit: "contain",
              maxWidth: "1500px",
              maxHeight: "1000px",
              borderRadius: "4px",
            }}
            width={"100%"}
            height={"100%"}
            src={fileUrl}
            onLoad={() => setImgLoading(false)}
            alt={fileName}
          />
        ) : (
          <Box mb={1}>
            <Typography>No available preview</Typography>
          </Box>
        )}
        {imgLoading ? (
          <Grid container alignItems={"center"} justifyContent={"center"}>
            <Box mb={3}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : undefined}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button
          variant={"outlined"}
          color={"secondary"}
          href={fileUrl}
          target={"_blank"}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StorageDownloadDialog;
