import React, { FC, useEffect, useMemo, useState } from 'react';
import { Container, Grid, Paper, Typography } from '@material-ui/core';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { INotificationConfig } from '../../models/notifications/NotificationModels';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { asyncSaveNotificationConfig } from '../../redux/slices/notificationsSlice';
import ConfigSaveSection from '../common/ConfigSaveSection';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
  simpleTextField: {
    width: '65ch',
  },
  formControl: {
    minWidth: 250,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  buttonSpacing: {
    marginLeft: theme.spacing(2),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
  },
  innerGrid: {
    padding: theme.spacing(3),
  },
  typography: {
    margin: '0px 10px 10px',
  },
}));

const NotificationConfig: FC = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { config } = useAppSelector((state) => state.notificationsSlice.data);
  const [edit, setEdit] = useState<boolean>(false);
  const methods = useForm<INotificationConfig>({
    defaultValues: useMemo(() => {
      return {
        active: config.active,
        providerName: config.providerName,
        firebase: {
          projectId: config.firebase.projectId,
          privateKey: config.firebase.privateKey,
          clientEmail: config.firebase.clientEmail,
        },
      };
    }, [config]),
  });
  const { reset, control, setValue } = methods;

  useEffect(() => {
    reset(config);
  }, [reset, config]);

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

  const onSubmit = (data: INotificationConfig) => {
    setEdit(false);
    const configToSave = {
      active: data.active,
      providerName: data.providerName,
      firebase: {
        projectId: data.firebase.projectId,
        privateKey: data.firebase.privateKey,
        clientEmail: data.firebase.clientEmail,
      },
    };

    dispatch(asyncSaveNotificationConfig(configToSave));
  };

  const handleFileChange = (file: File) => {
    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        const jsonToObject = JSON.parse(event.target.result);

        if (
          'project_id' in jsonToObject &&
          'private_key' in jsonToObject &&
          'client_email' in jsonToObject
        ) {
          setValue('firebase.projectId', jsonToObject.project_id);
          setValue('firebase.privateKey', jsonToObject.private_key);
          setValue('firebase.clientEmail', jsonToObject.client_email);
        }
      }
    };
  };

  const providers = [
    {
      name: 'firebase',
      label: 'Firebase',
    },
  ];

  return (
    <Container>
      <Paper className={classes.paper} elevation={5}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container>
              <Box
                width={'100%'}
                display={'inline-flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'h6'}>Activate Push-notifications Module</Typography>
                <FormInputSwitch name={'active'} disabled={!edit} />
              </Box>
              <Divider className={classes.divider} />
              <Grid container spacing={2} className={classes.innerGrid}>
                {isActive && (
                  <>
                    <Grid container item alignContent={'center'} xs={12}>
                      <FormInputSelect
                        label={'Provider name'}
                        name="providerName"
                        disabled={!edit}
                        options={providers?.map((provider) => ({
                          label: provider.name,
                          value: provider.name,
                        }))}
                      />
                    </Grid>
                    {hasProvider && (
                      <>
                        <Grid item xs={12}>
                          <FormInputText
                            name={'firebase.projectId'}
                            label={'Project Id'}
                            disabled={!edit}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormInputText
                            name={'firebase.privateKey'}
                            label={'Private key'}
                            disabled={!edit}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormInputText
                            name={'firebase.clientEmail'}
                            label={'Client Email'}
                            disabled={!edit}
                          />
                        </Grid>
                        <Typography className={classes.typography}> OR </Typography>
                        <Button
                          style={{ marginTop: '30px', marginLeft: '-25px' }}
                          disabled={!edit}
                          variant="contained"
                          component="label">
                          Upload JSON File
                          <input
                            type="file"
                            hidden
                            onChange={(event) => {
                              event.target.files && handleFileChange(event.target.files[0]);
                            }}
                          />
                        </Button>
                      </>
                    )}
                  </>
                )}
              </Grid>
              <Grid item container justifyContent="flex-end" xs={12}>
                <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      </Paper>
    </Container>
  );
};

export default NotificationConfig;
