import React from 'react';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { Clear, Send } from '@material-ui/icons';
import Button from '@material-ui/core/Button';
import { FormProvider, useForm } from 'react-hook-form';
import sharedClasses from '../common/sharedClasses';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { ISendSms } from '../../models/sms/SmsModels';
import { useAppDispatch } from '../../redux/store';
import { asyncSendSms } from '../../redux/slices/smsSlice';
import { Box } from '@material-ui/core';

const SendSms: React.FC = () => {
  const classes = sharedClasses();
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
      <Paper className={classes.paper} style={{ marginTop: 32 }}>
        <Typography variant="h6">Compose your SMS</Typography>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSend)}>
            <Grid container spacing={2}>
              <Grid item sm={12}>
                <FormInputText name="message" rows={4} label="Message" />
              </Grid>
              <Grid item sm={12}>
                <FormInputText name="to" label="Send to" />
              </Grid>
              <Grid item container justifyContent="flex-end" xs={12}>
                <Box marginTop={3}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Clear />}
                    style={{ marginRight: 16 }}
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
