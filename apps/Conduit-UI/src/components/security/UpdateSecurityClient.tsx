import React, { useMemo, useEffect } from 'react';
import Button from '@mui/material/Button';
import { useAppDispatch } from '../../redux/store';
import { Box } from '@mui/material';
import { IClient } from '../../models/security/SecurityModels';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../common/FormComponents/FormInputText';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';
import { asyncGetAvailableClients, asyncUpdateClient } from '../../redux/slices/securitySlice';
import { platforms } from '../../utils/platforms';
import Security from '../../assets/svgs/security.svg';
import { enqueueErrorNotification } from '../../utils/useNotifier';
import TemplateEditor from '../emails/TemplateEditor';
import Image from 'next/image';

interface Props {
  handleClose: () => void;
  client: IClient;
}

const UpdateSecurityClient: React.FC<Props> = ({ handleClose, client }) => {
  const dispatch = useAppDispatch();

  const methods = useForm<IClient>({
    defaultValues: useMemo(() => {
      return client;
    }, [client]),
  });

  useEffect(() => {
    methods.reset(client);
  }, [methods, client]);

  const isWeb = methods.watch('platform') === 'WEB';

  const onSubmit = (data: IClient) => {
    if (isWeb && (!data.domain || data.domain.length === 0)) {
      dispatch(enqueueErrorNotification(`Domain needs to be set for web clients`));
      return;
    }
    if (isWeb) {
      const formattedData = {
        alias: data.alias,
        notes: data.notes,
        domain: data.domain,
      };
      dispatch(asyncUpdateClient({ _id: data._id, data: formattedData }));
    } else {
      const formattedData = {
        alias: data.alias,
        notes: data.notes,
      };
      dispatch(asyncUpdateClient({ _id: data._id, data: formattedData }));
    }

    setTimeout(() => {
      dispatch(asyncGetAvailableClients());
    }, 140);
    handleClose();
  };

  return (
    <Box>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Box display="flex" flexDirection="column" gap={3} p={3}>
            <FormInputText name={'alias'} label={'Alias'} />
            {isWeb && <FormInputText name={'domain'} label={'domain'} />}
            <Controller
              name="notes"
              defaultValue=""
              render={({ field: { onChange, value } }) => (
                <TemplateEditor value={value} setValue={onChange} />
              )}
              rules={{ required: 'Template body required' }}
            />
            <FormInputSelect
              options={platforms.map((platform) => ({
                label: platform.label,
                value: platform.value,
              }))}
              name="platform"
              label="Platform"
              disabled
            />
          </Box>

          <Box p={3}>
            <Button variant={'contained'} type="submit" color={'secondary'} fullWidth>
              Update Client
            </Button>
          </Box>
        </form>
      </FormProvider>
      <Box textAlign="center" mt={12}>
        <Image src={Security} alt="security_icon" width="300px" height="300px" />
      </Box>
    </Box>
  );
};

export default UpdateSecurityClient;
