import { Button, Container } from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { IEmailConfig } from '../../models/emails/EmailModels';
import TransportSettings from './TransportSettings';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import ConfigSaveSection from '../common/ConfigSaveSection';
import { asyncUpdateEmailConfig } from '../../redux/slices/emailsSlice';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  innerGrid: {
    paddingLeft: theme.spacing(4),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
  },
}));

const EmailConfig: React.FC = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const { config } = useAppSelector((state) => state.emailsSlice.data);
  const [edit, setEdit] = useState<boolean>(false);

  const methods = useForm<IEmailConfig>({
    defaultValues: useMemo(() => {
      return config;
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

  const handleCancel = () => {
    setEdit(false);
    reset();
  };

  const onSubmit = (data: IEmailConfig) => {
    console.log('data', data);
    setEdit(false);
    dispatch(asyncUpdateEmailConfig(data));
  };

  const providers = [
    {
      name: 'mailgun',
      label: 'Mailgun',
    },
    {
      name: 'smtp',
      label: 'Smtp',
    },
    {
      name: 'mandrill',
      label: 'Mandrill',
    },
    {
      name: 'sendgrid',
      label: 'Sendgrid',
    },
  ];

  const renderSettingsFields = () => {
    return (
      <>
        <Grid item xs={12}>
          <Typography variant={'h6'}>Transport</Typography>
        </Grid>
        <Grid item xs={12}>
          <FormInputSelect
            label=""
            name="transport"
            options={providers.map((provider) => ({
              label: provider.label,
              value: provider.name,
            }))}
            textFieldProps={{
              fullWidth: false,
              helperText: 'Select your transport provider',
            }}
            disabled={!edit}
          />
        </Grid>
        <Grid item xs={12}>
          <FormInputText
            name="sendingDomain"
            label="Sending Domain"
            textFieldProps={{
              fullWidth: false,
            }}
            disabled={!edit}
          />
        </Grid>
        <Divider className={classes.divider} />
        <TransportSettings data={config} control={control} disabled={!edit} />
      </>
    );
  };

  return (
    <Container>
      <Paper className={classes.paper}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container>
              <Box
                width={'100%'}
                display={'inline-flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'h6'}>Activate Email Module</Typography>
                <FormInputSwitch name="active" />
              </Box>
              <Divider className={classes.divider} />
              <Grid container spacing={2} className={classes.innerGrid}>
                {isActive && renderSettingsFields()}
              </Grid>
              <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
            </Grid>
          </form>
        </FormProvider>
      </Paper>
    </Container>
  );
};

export default EmailConfig;
