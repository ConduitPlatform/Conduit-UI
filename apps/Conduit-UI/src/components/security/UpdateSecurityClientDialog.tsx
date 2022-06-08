import React, { useState, useMemo, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { useAppDispatch } from '../../redux/store';
import { Box } from '@mui/material';

import ClientPlatformEnum, { IClient } from '../../models/security/SecurityModels';

import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';

interface Props {
  open: boolean;
  handleClose: () => void;
  client: IClient;
}

const UpdateSecurityClientDialog: React.FC<Props> = ({ open, handleClose, client }) => {
  const dispatch = useAppDispatch();

  const methods = useForm<IClient>({
    defaultValues: useMemo(() => {
      return client;
    }, [client]),
  });

  useEffect(() => {
    methods.reset(client);
  }, [methods, client]);

  const platforms = [
    { label: 'WEB', value: ClientPlatformEnum.WEB },
    { label: 'ANDROID', value: ClientPlatformEnum.ANDROID },
    { label: 'IOS', value: ClientPlatformEnum.IOS },
    { label: 'IPADOS', value: ClientPlatformEnum.IPADOS },
    { label: 'LINUX', value: ClientPlatformEnum.LINUX },
    { label: 'MACOS', value: ClientPlatformEnum.MACOS },
    { label: 'WINDOWS', value: ClientPlatformEnum.WINDOWS },
  ];

  const showDomain = () => {
    return methods.getValues('platform') === 'WINDOWS';
  };

  const onSubmit = (data: IClient) => {
    console.log(data);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id="simple-dialog-title">
        Update Client {client?.clientId}
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', left: '92%', top: '1%', color: 'gray' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Box display="flex" flexDirection="column" gap={3} width="560px">
              <FormInputText name={'clientId'} label={'Client ID'} />
              {showDomain() && <FormInputText name={'domain'} label={'domain'} disabled />}
              <FormInputText name={'notes'} label={'Notes'} />
              <FormInputText name={'alias'} label={'Alias'} />
              <FormInputSelect
                options={platforms.map((platform) => ({
                  label: platform.label,
                  value: platform.value,
                }))}
                name="platform"
                label="Platform"
              />
            </Box>
            <Box width="100%" px={6} py={2}>
              <Button variant={'contained'} type="submit" color={'primary'} fullWidth>
                Generate new Client
              </Button>
            </Box>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSecurityClientDialog;

// {platform === ClientPlatformEnum.windows && (
//     <>
//       <TextField
//         size="small"
//         id="domain-field"
//         label="Domain"
//         margin={'normal'}
//         value={domain}
//         onChange={(event: React.ChangeEvent<{ value: string }>) =>
//           setDomain(event.target.value)
//         }></TextField>
//     </>
//   )}
