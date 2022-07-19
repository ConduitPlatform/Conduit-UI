import React, { useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import { AuthUser } from '../../models/authentication/AuthModels';
import { asyncEditUser } from '../../redux/slices/authenticationSlice';
import { useAppDispatch } from '../../redux/store';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { FormInputCheckBox } from '../common/FormComponents/FormInputCheckbox';
import { emailRegExp, phoneNumberRegExp } from '../../utils/validations';

interface Props {
  data: AuthUser;
  open: boolean;
  handleClose: () => void;
}

const EditUserDialog: React.FC<Props> = ({ data, open, handleClose }) => {
  const dispatch = useAppDispatch();
  const methods = useForm<AuthUser>({ defaultValues: data });

  const { handleSubmit, reset, setValue, register } = methods;

  useEffect(() => {
    setValue('email', data.email);
    setValue('phoneNumber', data.phoneNumber);
    setValue('active', data.active);
    setValue('isVerified', data.isVerified);
    setValue('hasTwoFA', data.hasTwoFA);
    setValue('_id', data._id);
  }, [data, setValue]);

  const onSubmit = (data: AuthUser) => {
    dispatch(asyncEditUser(data));
    reset();
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
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: emailRegExp,
                        message: 'Not a valid e-mail!',
                      },
                    })}
                    label="email"
                  />
                </Grid>
                <Grid item sm={12}>
                  <FormInputText
                    {...register('phoneNumber', {
                      pattern: {
                        value: phoneNumberRegExp,
                        message: 'Not a valid phone number',
                      },
                    })}
                    label="Phone Number"
                  />
                </Grid>
                <Grid item sm={3}>
                  <FormInputCheckBox {...register('active')} label="Active" />
                </Grid>
                <Grid item sm={3}>
                  <FormInputCheckBox {...register('isVerified')} label="Verified" />
                </Grid>
                <Grid item sm={3}>
                  <FormInputCheckBox
                    {...register('hasTwoFA')}
                    label="Has Two-factor Authentication"
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
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
