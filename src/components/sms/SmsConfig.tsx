import { Container } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { ISmsConfig } from '../../models/sms/SmsModels';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { asyncPutSmsConfig } from '../../redux/slices/smsSlice';

const useStyles = makeStyles((theme) => ({
  marginBottom: {
    marginBottom: theme.spacing(1),
  },
}));

const SmsConfig: React.FC = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const { config } = useAppSelector((state) => state.smsSlice.data);

  const [edit, setEdit] = useState<boolean>(false);
  const methods = useForm<ISmsConfig>({
    defaultValues: useMemo(() => {
      return {
        active: config.active,
        providerName: config.providerName,
        twilio: {
          phoneNumber: config.twilio.phoneNumber,
          accountSID: config.twilio.accountSID,
          authToken: config.twilio.authToken,
          verify: {
            active: config.twilio.verify.active,
            serviceSid: config.twilio.verify.serviceSid,
          },
        },
      };
    }, [config]),
  });

  const { reset, control } = methods;

  useEffect(() => {
    reset(config);
  }, [config, reset]);

  const isActive = useWatch({
    control,
    name: 'active',
  });

  const hasProvider = useWatch({
    control,
    name: 'providerName',
  });

  const handleCancel = () => {
    setEdit(!edit);
    reset();
  };

  const onSubmit = (data: ISmsConfig) => {
    setEdit(false);
    const configData = {
      active: data.active,
      providerName: data.providerName,
      twilio: {
        phoneNumber: data.twilio.phoneNumber,
        accountSID: data.twilio.accountSID,
        authToken: data.twilio.authToken,
        verify: {
          active: data.twilio.verify.active,
          serviceSid: data.twilio.verify.serviceSid,
        },
      },
    };
    dispatch(asyncPutSmsConfig(configData));
  };

  const providers = [
    {
      name: 'twilio',
      label: 'Twilio',
    },
  ];

  return (
    <Container>
      <Paper sx={{ p: 2, color: 'text.secondary' }}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid container item xs={12} justifyContent="space-between">
                <Typography variant={'h6'}>Sms Settings Module</Typography>
                <FormInputSwitch name={'active'} />
              </Grid>
              {isActive && (
                <>
                  <Grid item xs={2}>
                    <FormInputSelect
                      label={'Provider name'}
                      name="providerName"
                      disabled={!edit}
                      options={providers.map((provider) => ({
                        label: provider.name,
                        value: provider.name,
                      }))}
                    />
                  </Grid>
                  <Divider sx={{ mt: 1, mb: 1, width: '100%' }} />
                  {hasProvider && (
                    <Grid item container xs={4}>
                      <FormInputText
                        name={'twilio.phoneNumber'}
                        label={'Phone Number'}
                        disabled={!edit}
                        textFieldProps={{
                          className: classes.marginBottom,
                        }}
                      />
                      <FormInputText
                        name={'twilio.accountSID'}
                        label={'Account SID'}
                        disabled={!edit}
                        textFieldProps={{
                          className: classes.marginBottom,
                        }}
                      />
                      <FormInputText
                        name={'twilio.authToken'}
                        label={'Auth Token'}
                        disabled={!edit}
                        textFieldProps={{
                          className: classes.marginBottom,
                        }}
                      />
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">Verify:</Typography>
                      </Grid>
                      <Box style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>Active</Typography>
                        <FormInputSwitch name={'twilio.verify.active'} />
                      </Box>
                      <FormInputText
                        name={'twilio.verify.serviceSid'}
                        label={'Service SID'}
                        disabled={!edit}
                      />
                    </Grid>
                  )}
                  <Grid item container xs={12} justifyContent={'flex-end'}>
                    {edit ? (
                      <>
                        <Button onClick={() => handleCancel()} sx={{ mr: 2 }} color={'primary'}>
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          sx={{ alignSelf: 'flex-end' }}
                          variant="contained"
                          color="primary">
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button variant="contained" color="primary" onClick={() => setEdit(true)}>
                        Edit
                      </Button>
                    )}
                  </Grid>
                </>
              )}
            </Grid>
          </form>
        </FormProvider>
      </Paper>
    </Container>
  );
};

export default SmsConfig;
