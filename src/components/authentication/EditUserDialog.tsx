import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import EmailIcon from '@mui/icons-material/Email';
import Button from '@mui/material/Button';
import PhoneIcon from '@mui/icons-material/Phone';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { AuthUser } from '../../models/authentication/AuthModels';
import { asyncEditUser } from '../../redux/slices/authenticationSlice';
import { useAppDispatch } from '../../redux/store';

interface Props {
  data: AuthUser;
  open: boolean;
  handleClose: () => void;
}

const EditUserDialog: React.FC<Props> = ({ data, open, handleClose }) => {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState<AuthUser>({
    email: '',
    phoneNumber: '',
    active: false,
    isVerified: false,
    hasTwoFA: false,
    updatedAt: '',
    createdAt: '',
    _id: '',
  });

  useEffect(() => {
    setValues({ ...data });
  }, [data]);

  const handleInputChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;

    setValues({ ...values, [name]: value });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    dispatch(asyncEditUser(values));
    handleClose();
  };

  const handleCheckBoxChange = (event: { target: { name: string; checked: boolean } }) => {
    setValues({ ...values, [event.target.name]: event.target.checked });
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id="simple-dialog-title">
        Edit user
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', left: '92%', top: '1%', color: 'gray' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Container
            sx={{
              flexGrow: 6,
              alignItems: 'center',
              justifyContent: 'center',
              justifyItems: 'center',
              justifySelf: 'center',
            }}
            maxWidth="sm">
            <Grid
              container
              alignItems="center"
              sx={{
                flexGrow: 6,
                alignItems: 'center',
                justifyContent: 'center',
                justifyItems: 'center',
                justifySelf: 'center',
              }}
              spacing={2}>
              <Grid item sm={12}>
                <TextField
                  fullWidth
                  sx={{ textAlign: 'center' }}
                  variant="outlined"
                  id="email"
                  name="email"
                  label="Username/Email"
                  onChange={handleInputChange}
                  value={values.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item sm={12}>
                <TextField
                  fullWidth
                  variant="outlined"
                  id="phoneNumber"
                  name="phoneNumber"
                  label="Phone number"
                  onChange={handleInputChange}
                  value={values.phoneNumber}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item sm={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.active}
                      onChange={handleCheckBoxChange}
                      name="active"
                      color="secondary"
                    />
                  }
                  label="Active"
                />
              </Grid>
              <Grid item sm={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.isVerified}
                      onChange={handleCheckBoxChange}
                      name="isVerified"
                      color="secondary"
                    />
                  }
                  label="Verified"
                />
              </Grid>
              <Grid item sm={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.hasTwoFA}
                      onChange={handleCheckBoxChange}
                      name="hasTwoFA"
                      color="secondary"
                      disabled={!values.phoneNumber}
                    />
                  }
                  label="Has 2 factor authentication"
                />
              </Grid>
              <Grid item sm={12}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<DoneOutlineIcon />}>
                  Save
                </Button>
              </Grid>
            </Grid>
          </Container>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
