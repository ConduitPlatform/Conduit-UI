import React, { FC } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { ReportProblemOutlined } from '@mui/icons-material';
import { useAppDispatch } from '../../../../../redux/store';
import { useRouter } from 'next/router';
import { clearSelectedSchema } from '../../../store/databaseSlice';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  name: string;
  introspection?: boolean;
}

const ReturnDialog: FC<Props> = ({ open, setOpen, name, introspection }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleBackButtonClick = () => {
    dispatch(clearSelectedSchema());
    if (introspection) {
      router.push({ pathname: '/database/introspection' });
    } else router.push({ pathname: '/database/schemas' });
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>
        <Box display="flex" gap={2}>
          <Typography>Discard changes?</Typography>
          <ReportProblemOutlined color="error" />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>
          The model was modified, if you proceed any changes you have made will be lost!
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={handleBackButtonClick} variant="outlined" color="error">
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReturnDialog;
