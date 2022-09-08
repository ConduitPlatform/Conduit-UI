import React from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Clear, Send, Sms } from '@mui/icons-material';
import Button from '@mui/material/Button';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { ISendSms } from '../../models/sms/SmsModels';
import { useAppDispatch } from '../../redux/store';
import { asyncSendSms } from '../../redux/slices/smsSlice';
import { Box } from '@mui/material';
import { phoneNumberRegExp } from '../../utils/validations';

const SendSms: React.FC = () => {
  const dispatch = useAppDispatch();

  const methods = useForm<ISendSms>({
    defaultValues: {
      message: '',
      to: '',
    },
  });

  const { reset, register } = methods;

  const handleSend = (data: ISendSms) => {
    dispatch(asyncSendSms(data));
    reset();
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={0} sx={{ p: 4, color: 'text.primary', borderRadius: 8 }}>
        <Box>
          <Typography variant={'h6'} sx={{ mb: 4 }}>
            <Sms fontSize={'small'} /> Compose your SMS
          </Typography>
        </Box>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSend)}>
            <Grid container spacing={2}>
              <Grid item sm={12}>
                <FormInputText
                  {...register('to', {
                    required: 'phone number is required',
                    pattern: {
                      value: phoneNumberRegExp,
                      message: 'Not a valid phone number!',
                    },
                  })}
                  label="Send to"
                  typeOfInput={'text'}
                />
              </Grid>
              <Grid item sm={12}>
                <FormInputText {...register('message')} rows={4} label="Message" />
              </Grid>
              <Grid item container justifyContent="flex-end" xs={12}>
                <Box marginTop={3}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Clear />}
                    sx={{ marginRight: 4 }}
                    onClick={() => reset()}>
                    Clear
                  </Button>
                  <Button variant="contained" color="primary" startIcon={<Send />} type="submit">
                    Send
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      </Paper>
    </Container>
  );
};

export default SendSms;
