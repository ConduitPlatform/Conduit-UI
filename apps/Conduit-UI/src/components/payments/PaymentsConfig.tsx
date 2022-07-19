import React, { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { asyncUpdatePaymentConfig } from '../../redux/slices/paymentsSlice';
import { ConfigSaveSection, ConfigContainer } from '@conduitplatform/ui-components';

interface FormProps {
  active: boolean;
  enabled: boolean;
  secret_key: string;
}

const PaymentsConfig: React.FC = () => {
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
  const { reset, control, register } = methods;

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
    <ConfigContainer>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Grid container>
            <Box
              width={'100%'}
              display={'inline-flex'}
              justifyContent={'space-between'}
              alignItems={'center'}>
              <Typography variant={'h6'}>Activate Payments Module</Typography>
              <FormInputSwitch {...register('active')} disabled={!edit} />
            </Box>

            <Divider sx={{ mt: 2, mb: 2, width: '100%' }} />

            <Grid container spacing={2} sx={{ pl: 4 }}>
              {isActive && (
                <>
                  <Grid item xs={6}>
                    <Box
                      width={'100%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography variant={'h6'}>Enable stripe payments</Typography>
                      <FormInputSwitch {...register('enabled')} disabled={!edit} />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant={'h6'}>Stripe secret key</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormInputText
                      {...register('secret_key')}
                      label={'Secret key'}
                      disabled={!edit}
                    />
                  </Grid>
                </>
              )}
            </Grid>
            <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
          </Grid>
        </form>
      </FormProvider>
    </ConfigContainer>
  );
};

export default PaymentsConfig;
