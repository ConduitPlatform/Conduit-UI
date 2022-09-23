import React, { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { IFormsConfig } from '../../models/forms/FormsModels';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { asyncEditFormsConfig } from '../../redux/slices/formsSlice';
import { ConfigContainer, ConfigSaveSection, RichTooltip } from '@conduitplatform/ui-components';
import { Icon } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

const FormsConfig: React.FC = () => {
  const dispatch = useAppDispatch();

  const [openTooltip, setOpenTooltip] = useState<boolean>(false);
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

  const MouseOverTooltip = () => {
    setOpenTooltip(!openTooltip);
  };

  const MouseOutTooltip = () => {
    setOpenTooltip(false);
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
                <Box display="flex" onMouseOver={MouseOverTooltip} onMouseOut={MouseOutTooltip}>
                  <RichTooltip
                    content={<Typography variant="caption">Placeholder...</Typography>}
                    open={openTooltip}
                    onClose={MouseOutTooltip}>
                    <Icon>
                      <InfoOutlined />
                    </Icon>
                  </RichTooltip>
                </Box>
              </Box>
              <FormInputSwitch {...register('active', { disabled: !edit })} />
            </Box>

            <Grid container spacing={2} sx={{ pl: 4, mb: 1 }}>
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
