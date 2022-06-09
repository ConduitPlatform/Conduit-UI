import React, { useMemo, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { useAppDispatch } from '../../redux/store';
import { Box } from '@mui/material';
import { IClient } from '../../models/security/SecurityModels';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';
import { asyncGetAvailableClients, asyncUpdateClient } from '../../redux/slices/securitySlice';
import { platforms } from '../../utils/platforms';
import { enqueueErrorNotification } from '../../utils/useNotifier';

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

  const showDomain = () => {
    return methods.getValues('platform') === 'WEB';
  };

  const onSubmit = (data: IClient) => {
    if (data.platform === 'WEB' && (!data.domain || data.domain.length === 0)) {
      dispatch(enqueueErrorNotification(`Domain needs to be set for web clients`));
      return;
    }
    dispatch(asyncUpdateClient({ _id: data._id, data }));
    setTimeout(() => {
      dispatch(asyncGetAvailableClients());
    }, 140);
    handleClose();
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
              <FormInputText name={'alias'} label={'Alias'} />
              {showDomain() && <FormInputText name={'domain'} label={'domain'} disabled />}
              <FormInputText name={'notes'} label={'Notes'} />
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
                Update Client
              </Button>
            </Box>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSecurityClientDialog;
