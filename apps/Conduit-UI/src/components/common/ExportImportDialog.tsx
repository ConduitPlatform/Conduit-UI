import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/FileDownload';
import UploadIcon from '@mui/icons-material/FileUpload';
import Grid from '@mui/material/Grid';
interface Props {
  open: boolean;
  handleClose: () => void;
  title?: string;
  handleImport?: (json: any) => void;
  importInfo?: string;
  handleExport?: () => void;
  exportInfo?: string;
}
const ExportImportDialog: React.FC<Props> = ({
  open,
  handleClose,
  title,
  handleImport,
  importInfo,
  handleExport,
  exportInfo,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!open) setError(undefined);
  }, [open]);

  const generateTitle = (title?: string) => {
    return `Export / Import${title ? `: ${title}` : null}`;
  };

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target?.files?.[0]) return;
      new Response(e.target.files[0]).json().then(
        (json) => {
          setError(undefined);
          handleImport?.(json);
        },
        (err) => {
          console.log(err);
          setError('Could not parse json file for import');
        }
      );
    },
    [handleImport]
  );

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  return (
    <Dialog fullWidth={true} maxWidth={'md'} open={open} onClose={handleClose}>
      <DialogTitle id="new-custom-type" sx={{ marginBottom: '16px' }}>
        {generateTitle(title)}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={4}>
          {handleExport && (
            <>
              <Grid item xs={6} display={'flex'} flexDirection={'column'}>
                <Typography variant="subtitle1" fontWeight={'bold'}>
                  Export:
                </Typography>
                <Typography variant="caption">download .json file containing {title}</Typography>
                {exportInfo && (
                  <Typography fontWeight={'bold'} variant="caption" sx={{ whiteSpace: 'pre-line' }}>
                    {exportInfo}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={1} display={'flex'} justifyContent={'center'}>
                <Divider orientation={'vertical'} />
              </Grid>
              <Grid item xs={5} display={'flex'} alignItems={'center'}>
                <Button
                  onClick={handleExport}
                  variant="contained"
                  fullWidth
                  startIcon={<DownloadIcon />}>
                  Export
                </Button>
              </Grid>
            </>
          )}
          {handleImport && (
            <>
              <Grid item xs={6} display={'flex'} flexDirection={'column'}>
                <Typography variant="subtitle1" fontWeight={'bold'}>
                  Import:
                </Typography>
                <Typography variant="caption">upload .json file containing {title}</Typography>
                {importInfo && (
                  <Typography fontWeight={'bold'} variant="caption" sx={{ whiteSpace: 'pre-line' }}>
                    {importInfo}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={1} display={'flex'} justifyContent={'center'}>
                <Divider orientation={'vertical'} />
              </Grid>
              <Grid item xs={5} display={'flex'} alignItems={'center'}>
                <Button
                  onClick={handleUploadClick}
                  variant="contained"
                  color={'warning'}
                  fullWidth
                  startIcon={<UploadIcon />}>
                  Import
                </Button>
                <input
                  type="file"
                  ref={inputRef}
                  onChange={handleFileChange}
                  accept="application/JSON"
                  style={{ display: 'none' }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        {error && (
          <Typography variant="caption" color={'error'} marginRight={2}>
            {error}
          </Typography>
        )}
        <Button onClick={handleClose} variant="outlined" sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
      </DialogActions>
      <Button onClick={handleClose} sx={{ position: 'absolute', top: 10, right: 2 }}>
        <CloseIcon />
      </Button>
    </Dialog>
  );
};

export default ExportImportDialog;
