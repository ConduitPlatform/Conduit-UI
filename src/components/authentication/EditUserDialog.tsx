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
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { FormInputCheckBox } from '../common/FormComponents/FormInputCheckbox';

interface Props {
  data: AuthUser;
  open: boolean;
  handleClose: () => void;
}

const EditUserDialog: React.FC<Props> = ({ data, open, handleClose }) => {
  const dispatch = useAppDispatch();
  const methods = useForm<AuthUser>({ defaultValues: data });

  const { handleSubmit, reset, setValue } = methods;

  useEffect(() => {
    setValue('email', data.email);
    setValue('phoneNumber', data.phoneNumber);
    setValue('active', data.active);
    setValue('isVerified', data.isVerified);
    setValue('hasTwoFA', data.hasTwoFA);
  }, [data]);

  const onSubmit = (data: AuthUser) => {
    dispatch(asyncEditUser(data));
    handleClose();
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
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
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
                  <FormInputText
                    name="email"
                    label="email"
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                        message: 'Not a valid e-mail!',
                      },
                    }}
                  />
                </Grid>
                <Grid item sm={12}>
                  <FormInputText name="phoneNumber" label="Phone Number" />
                </Grid>
                <Grid item sm={3}>
                  <FormInputCheckBox name="active" label="Active" />
                </Grid>
                <Grid item sm={3}>
                  <FormInputCheckBox name="isVerified" label="Verified" />
                </Grid>
                <Grid item sm={3}>
                  <FormInputCheckBox name="hasTwoFA" label="Has Two-factor Authentication" />
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
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
