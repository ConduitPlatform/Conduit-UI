import React, { useEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { ConfigContainer, ConfigSaveSection } from '@conduitplatform/ui-components';
import { asyncPutSecurityConfig } from '../../redux/slices/securitySlice';
import { ISecurityConfig } from '../../models/security/SecurityModels';

const SecurityConfig: React.FC = () => {
  const dispatch = useAppDispatch();

  const { config } = useAppSelector((state) => state.securitySlice.data);

  const [edit, setEdit] = useState<boolean>(false);
  const methods = useForm<ISecurityConfig>({
    defaultValues: useMemo(() => {
      return {
        clientValidation: {
          enabled: config.clientValidation.enabled,
        },
      };
    }, [config]),
  });

  const { reset } = methods;

  useEffect(() => {
    reset(config);
  }, [config, reset]);

  const handleCancel = () => {
    setEdit(!edit);
    reset();
  };

  const onSubmit = (data: ISecurityConfig) => {
    setEdit(false);
    dispatch(asyncPutSecurityConfig(data));
  };

  return (
    <ConfigContainer>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Grid spacing={2}>
            <Grid item xs={6}>
              <Box
                width={'100%'}
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'subtitle1'}>Require Client ID/Secret validation</Typography>
                <FormInputSwitch name={'clientValidation.enabled'} disabled={!edit} />
              </Box>
            </Grid>
            <Divider sx={{ mt: 1, mb: 1, width: '100%' }} />
            <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
          </Grid>
        </form>
      </FormProvider>
    </ConfigContainer>
  );
};

export default SecurityConfig;
