import React, { useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { IChatConfig } from '../../models/chat/ChatModels';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { asyncPutChatConfig } from '../../redux/slices/chatSlice';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormInputSwitch } from '../common/FormComponents/FormInputSwitch';
import { ConfigSaveSection, ConfigContainer, RichTooltip } from '@conduitplatform/ui-components';
import { InfoOutlined } from '@mui/icons-material';
import { Button, Icon } from '@mui/material';

const ChatConfig: React.FC = () => {
  const dispatch = useAppDispatch();

  const [openTooltip, setOpenTooltip] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);

  const { config } = useAppSelector((state) => state.chatSlice);

  const methods = useForm<IChatConfig>({
    defaultValues: useMemo(() => {
      return config;
    }, [config]),
  });

  const { control, register } = methods;

  useEffect(() => {
    methods.reset(config);
  }, [methods, config]);

  const isActive = useWatch({
    control,
    name: 'active',
  });

  const handleCancel = () => {
    setEdit(!edit);
    methods.reset();
  };

  const MouseOverTooltip = () => {
    setOpenTooltip(!openTooltip);
  };

  const MouseOutTooltip = () => {
    setOpenTooltip(false);
  };

  const onSubmit = (data: IChatConfig) => {
    setEdit(false);
    dispatch(asyncPutChatConfig(data));
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
                <Typography variant={'h6'}>Activate Chat Module</Typography>
                <Box
                  display="flex"
                  alignItems="center"
                  onMouseOver={MouseOverTooltip}
                  onMouseOut={MouseOutTooltip}>
                  <RichTooltip
                    content={
                      <Box display="flex" flexDirection="column" gap={2} p={2}>
                        <Typography variant="body2">
                          To see more information regarding the Chat config, please visit our docs!
                        </Typography>
                        <Box display="flex" justifyContent="flex-end">
                          <a
                            href="https://getconduit.dev/docs/modules/chat/config"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none' }}>
                            <Button variant="outlined">Take me there</Button>
                          </a>
                        </Box>
                      </Box>
                    }
                    width="400px"
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
            <Grid container spacing={2} sx={{ paddingLeft: 4, mt: 1 }}>
              {isActive && (
                <>
                  <Grid item xs={12}>
                    <Box
                      width={'50%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography variant={'subtitle1'}>Allow Message Edit</Typography>
                      <FormInputSwitch {...register('allowMessageEdit', { disabled: !edit })} />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box
                      width={'50%'}
                      display={'inline-flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}>
                      <Typography variant={'subtitle1'}>Allow Message Delete</Typography>
                      <FormInputSwitch {...register('allowMessageDelete', { disabled: !edit })} />
                    </Box>
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

export default ChatConfig;
