import React, { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { FormInputSwitch } from '../../../components/common/FormComponents/FormInputSwitch';
import { FormInputText } from '../../../components/common/FormComponents/FormInputText';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { asyncUpdatePaymentConfig } from '../store/paymentsSlice';
import { ConfigContainer, ConfigSaveSection } from '@conduitplatform/ui-components';
import { FormInputSelect } from '../../../components/common/FormComponents/FormInputSelect';

interface FormProps {
  active: boolean;
  stripe: {
    enabled: boolean;
    secret_key: string;
  };
  viva: {
    enabled: boolean;
    // sandbox or production
    environment: string;
    mid: string;
    apiKey: string;
    smartCheckout: {
      clientId: string;
      clientSecret: string;
    };
  };
}

const PaymentsConfig: React.FC = () => {
  const dispatch = useAppDispatch();

  const { config } = useAppSelector((state) => state.paymentsSlice.data);

  const [edit, setEdit] = useState<boolean>(false);
  const methods = useForm<FormProps>({
    defaultValues: useMemo(() => {
      return config;
    }, [config]),
  });
  const { reset, control, register } = methods;

  useEffect(() => {
    reset(config);
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
      ...dataToSubmit,
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
              <FormInputSwitch {...register('active', { disabled: !edit })} />
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
                      <Typography variant={'h6'}>Enable Stripe payments</Typography>
                      <FormInputSwitch {...register('stripe.enabled', { disabled: !edit })} />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant={'h6'}>Stripe secret key</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormInputText
                      {...register('stripe.secret_key', { disabled: !edit })}
                      label={'Secret key'}
                    />
                  </Grid>
                  <Divider sx={{ mt: 2, mb: 2, width: '100%' }} />
                  <Grid item xs={6}>
                    <Box
                      width={'100%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography variant={'h6'}>Enable Viva payments</Typography>
                      <FormInputSwitch {...register('viva.enabled', { disabled: !edit })} />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant={'h6'}>Viva environment</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormInputSelect
                      {...register('viva.environment', { disabled: !edit })}
                      label="Environment"
                      options={[
                        { label: 'Sandbox', value: 'sandbox' },
                        { label: 'Production', value: 'production' },
                      ]}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <FormInputText
                      {...register('viva.mid', { disabled: !edit })}
                      label="Merchant ID"
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <FormInputText
                      {...register('viva.apiKey', { disabled: !edit })}
                      label="API KEY"
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <FormInputText
                      {...register('viva.smartCheckout.clientId', { disabled: !edit })}
                      label="SmartCheckout ClientID"
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <FormInputText
                      {...register('viva.smartCheckout.clientSecret', { disabled: !edit })}
                      label="SmartCheckout ClientSecret"
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
