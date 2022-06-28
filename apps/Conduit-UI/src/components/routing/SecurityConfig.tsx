import React, { useEffect, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { ConfigContainer } from '@conduitplatform/ui-components';
import { asyncPutSecurityConfig } from '../../redux/slices/securitySlice';
import { ISecurityConfig } from '../../models/security/SecurityModels';

const SecurityConfig: React.FC = () => {
  const dispatch = useAppDispatch();

  const { config } = useAppSelector((state) => state.securitySlice.data);

  const methods = useForm<ISecurityConfig>({
    defaultValues: useMemo(() => {
      return {
        security: { clientValidation: config.security?.clientValidation },
      };
    }, [config]),
  });

  const { reset } = methods;

  useEffect(() => {
    reset(config);
  }, [config, reset]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (config.security) {
      config['security']['clientValidation'] = event.target.checked;
      dispatch(asyncPutSecurityConfig(config));
    }
  };

  return (
    <ConfigContainer>
      <FormProvider {...methods}>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box
                width={'100%'}
                display={'inline-flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'h6'} color={'#FFFFFF'}>
                  Require Client ID/Secret validation
                </Typography>
                <FormInputSwitch name={'clientValidation'} switchProps={{ onChange }} />
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </ConfigContainer>
  );
};

export default SecurityConfig;
