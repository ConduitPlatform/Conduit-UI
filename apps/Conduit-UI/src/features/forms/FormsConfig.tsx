import React, { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { IFormsConfig } from './FormsModels';
import { FormInputSwitch } from '../../components/common/FormComponents/FormInputSwitch';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { asyncEditFormsConfig } from './formsSlice';
import { ConduitTooltip, ConfigContainer, ConfigSaveSection } from '@conduitplatform/ui-components';
import Button from '@mui/material/Button';
import { Icon, useTheme } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

const FormsConfig: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const [edit, setEdit] = useState<boolean>(false);

  const { config } = useAppSelector((state) => state.formsSlice.data);

  const methods = useForm<IFormsConfig>({
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

  const onSubmit = (data: IFormsConfig) => {
    setEdit(false);
    const updatedConfig = {
      ...config,
      ...data,
    };
    dispatch(asyncEditFormsConfig(updatedConfig));
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
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant={'h6'}>Activate Forms Module</Typography>

                <ConduitTooltip
                  title={
                    <Box display="flex" flexDirection="column" gap={2} p={2}>
                      <Typography variant="body2">
                        To see more information regarding the Forms config, please visit our docs
                      </Typography>
                      <Box display="flex" justifyContent="flex-end">
                        <a
                          href="https://getconduit.dev/docs/modules/forms/config"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}>
                          <Button variant="outlined">Take me there</Button>
                        </a>
                      </Box>
                    </Box>
                  }>
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
            <Grid container sx={{ pl: 4, mb: 1 }}>
              {isActive && (
                <Grid item xs={12}>
                  <Box
                    width={'100%'}
                    display={'inline-flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}>
                    <Typography variant={'h6'}>Use Attachments</Typography>
                    <FormInputSwitch {...register('useAttachments', { disabled: !edit })} />
                  </Box>
                </Grid>
              )}
            </Grid>
            <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
          </Grid>
        </form>
      </FormProvider>
    </ConfigContainer>
  );
};

export default FormsConfig;
