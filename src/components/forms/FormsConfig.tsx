import { Container } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import makeStyles from '@mui/styles/makeStyles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { IFormsConfig } from '../../models/forms/FormsModels';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { asyncEditFormsConfig } from '../../redux/slices/formsSlice';
import ConfigSaveSection from '../common/ConfigSaveSection';

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
  alignEnd: {
    alignSelf: 'flex-end',
  },
  marginRight: {
    marginRight: '16px',
  },
}));

const FormsConfig: React.FC = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [edit, setEdit] = useState<boolean>(false);
  const { config } = useAppSelector((state) => state.formsSlice.data);

  const methods = useForm<IFormsConfig>({
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

  const onSubmit = (data: IFormsConfig) => {
    setEdit(false);
    const updatedConfig = {
      ...config,
      ...data,
    };
    dispatch(asyncEditFormsConfig(updatedConfig));
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
                <Typography variant={'h6'}>Activate Forms Module</Typography>
                <FormInputSwitch disabled={!edit} name={'active'} />
              </Box>

              <Divider className={classes.divider} />

              <Grid container spacing={2} className={classes.innerGrid}>
                {isActive && (
                  <Grid item xs={12}>
                    <Box
                      width={'100%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography variant={'h6'}>Use Attachments</Typography>
                      <FormInputSwitch disabled={!edit} name={'useAttachments'} />
                    </Box>
                  </Grid>
                )}
              </Grid>
              <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
            </Grid>
          </form>
        </FormProvider>
      </Paper>
    </Container>
  );
};

export default FormsConfig;
