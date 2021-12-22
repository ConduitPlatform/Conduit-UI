import { Container } from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { ISmsConfig } from '../../models/sms/SmsModels';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { asyncPutSmsConfig } from '../../redux/slices/smsSlice';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  divider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '100%',
  },
  menuItem: {
    textTransform: 'capitalize',
  },
  muiSelect: {
    textTransform: 'capitalize',
  },
  marginBottom: {
    marginBottom: theme.spacing(1),
  },
  cancel: {
    marginRight: theme.spacing(2),
  },
  submit: {
    alignSelf: 'flex-end',
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
      <Paper className={classes.paper}>
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
                  <Divider className={classes.divider} />
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
                        <Button
                          onClick={() => handleCancel()}
                          className={classes.cancel}
                          color={'primary'}>
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className={classes.submit}
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
