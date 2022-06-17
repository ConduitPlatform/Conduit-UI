import React, { useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { useAppDispatch } from '../../redux/store';
import { Box } from '@mui/material';
import ClientPlatformEnum, { ICreateClient } from '../../models/security/SecurityModels';
import { asyncGenerateNewClient, asyncGetAvailableClients } from '../../redux/slices/securitySlice';
import { enqueueErrorNotification } from '../../utils/useNotifier';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { createPlatforms } from '../../utils/platforms';

interface Props {
  open: boolean;
  handleClose: () => void;
  handleSuccess: () => void;
}

const CreateSecurityClientDialog: React.FC<Props> = ({ open, handleClose, handleSuccess }) => {
  const dispatch = useAppDispatch();

  const methods = useForm<ICreateClient>({
    defaultValues: { platform: ClientPlatformEnum.WEB, domain: '*', alias: '', notes: '' },
  });

  const isWeb = methods.watch('platform') === 'WEB';

  useEffect(() => {
    methods.reset({ platform: ClientPlatformEnum.WEB, domain: '*', alias: '', notes: '' });
  }, [methods, open]);

  const onSubmit = (data: ICreateClient) => {
    if (data.platform === 'WEB' && (!data.domain || data.domain.length === 0)) {
      dispatch(enqueueErrorNotification(`Domain needs to be set for web clients`));
      return;
    }
    dispatch(
      asyncGenerateNewClient({
        platform: data.platform,
        domain: data.platform === 'WEB' ? data.domain : undefined,
        notes: data.notes,
        alias: data.alias,
      })
    );

    setTimeout(() => {
      dispatch(asyncGetAvailableClients({}));
    }, 140);

    handleSuccess();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id="simple-dialog-title">
        Create client
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', left: '92%', top: '1%', color: 'gray' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Box display="flex" flexDirection="column" gap={3} width="560px" p={3}>
              <FormInputSelect
                options={createPlatforms.map((platform) => ({
                  label: platform.label,
                  value: platform.value,
                }))}
                name="platform"
                label="Platform"
              />
              {isWeb && <FormInputText name={'domain'} label={'Domain'} />}
              <FormInputText name={'alias'} label={'Alias'} />
              <FormInputText name={'notes'} label={'Notes'} />
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

export default CreateSecurityClientDialog;
