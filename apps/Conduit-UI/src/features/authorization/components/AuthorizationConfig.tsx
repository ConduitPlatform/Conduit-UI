import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { IAuthorizationConfig } from '../models/AuthorizationModels';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormInputSwitch } from '../../../components/common/FormComponents/FormInputSwitch';
import { ConduitTooltip, ConfigContainer, ConfigSaveSection } from '@conduitplatform/ui-components';
import { Icon, useTheme } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { asyncUpdateAuthzConfig } from '../store/authorizationSlice';

const AuthorizationConfig: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const [edit, setEdit] = useState<boolean>(false);

  const { config } = useAppSelector((state) => state.authorizationSlice);

  const methods = useForm<IAuthorizationConfig>({
    defaultValues: useMemo(() => {
      return config;
    }, [config]),
  });

  const { reset, control, register } = methods;

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

  const onSubmit = useCallback(
    (data: IAuthorizationConfig) => {
      setEdit(false);
      dispatch(asyncUpdateAuthzConfig(data));
    },
    [dispatch]
  );

  return (
    <ConfigContainer>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Grid container>
            <Box
              width={'100%'}
              display={'inline-flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              mb={1}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant={'h6'}>Activate Authorization Module</Typography>
                <ConduitTooltip title={'This allows you to configure the authorization module'}>
                  <Icon
                    sx={{
                      display: 'flex',
                      color:
                        theme.palette.mode === 'dark'
                          ? theme.palette.common.white
                          : theme.palette.common.black,
                    }}>
                    <InfoOutlined />
                  </Icon>
                </ConduitTooltip>
              </Box>
              <FormInputSwitch {...register('active', { disabled: !edit })} />
            </Box>
            <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
          </Grid>
        </form>
      </FormProvider>
    </ConfigContainer>
  );
};

export default AuthorizationConfig;
