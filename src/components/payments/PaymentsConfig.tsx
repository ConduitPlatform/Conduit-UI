import { Container } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import makeStyles from '@mui/styles/makeStyles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { asyncUpdatePaymentConfig } from '../../redux/slices/paymentsSlice';
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
}));

interface FormProps {
  active: boolean;
  enabled: boolean;
  secret_key: string;
}

const PaymentsConfig: React.FC = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const { config } = useAppSelector((state) => state.paymentsSlice.data);

  const [edit, setEdit] = useState<boolean>(false);
  const methods = useForm<FormProps>({
    defaultValues: useMemo(() => {
      return {
        active: config.active,
        enabled: config.stripe.enabled,
        secret_key: config.stripe.secret_key,
      };
    }, [config]),
  });
  const { reset, control } = methods;

  useEffect(() => {
    reset({
      active: config.active,
      enabled: config.stripe.enabled,
      secret_key: config.stripe.secret_key,
    });
  }, [reset, config]);

  const isActive = useWatch({
    control,
    name: 'active',
  });

  const handleCancel = () => {
    setEdit(false);
    reset();
  };

  const onSubmit = (dataToSubmit: FormProps) => {
    const data = {
      active: dataToSubmit.active,
      stripe: {
        enabled: dataToSubmit.enabled,
        secret_key: dataToSubmit.secret_key,
      },
    };
    setEdit(false);
    const body = {
      ...config,
      ...data,
    };

    dispatch(asyncUpdatePaymentConfig(body));
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
                <Typography variant={'h6'}>Activate Payments Module</Typography>
                <FormInputSwitch name={'active'} disabled={!edit} />
              </Box>

              <Divider className={classes.divider} />

              <Grid container spacing={2} className={classes.innerGrid}>
                {isActive && (
                  <>
                    <Grid item xs={6}>
                      <Box
                        width={'100%'}
                        display={'inline-flex'}
                        justifyContent={'space-between'}
                        alignItems={'center'}>
                        <Typography variant={'h6'}>Enable stripe payments</Typography>
                        <FormInputSwitch name={'enabled'} disabled={!edit} />
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant={'h6'}>Stripe secret key</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <FormInputText name={'secret_key'} label={'Secret key'} disabled={!edit} />
                    </Grid>
                  </>
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

export default PaymentsConfig;
