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

const SendSms: React.FC = () => {
  const dispatch = useAppDispatch();

  const methods = useForm<ISendSms>({
    defaultValues: {
      message: '',
      to: '',
    },
  });

  const { reset } = methods;

  const handleSend = (data: ISendSms) => {
    dispatch(asyncSendSms(data));
    reset();
  };

  return (
    <Container>
      <Paper sx={{ p: 2, color: 'text.secondary', mt: 2, borderRadius: 8 }}>
        <Box>
          <Typography variant={'h6'} sx={{ mb: 4 }}>
            <Sms fontSize={'small'} /> Compose your SMS
          </Typography>
        </Box>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSend)}>
            <Grid container spacing={2}>
              <Grid item sm={12}>
                <FormInputText name="to" label="Send to" />
              </Grid>
              <Grid item sm={12}>
                <FormInputText name="message" rows={4} label="Message" />
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
