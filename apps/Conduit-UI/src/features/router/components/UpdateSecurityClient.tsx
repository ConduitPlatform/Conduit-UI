import React, { useMemo, useEffect } from 'react';
import Button from '@mui/material/Button';
import { useAppDispatch } from '../../../redux/store';
import { Box, IconButton } from '@mui/material';
import { IClient, IUpdateClient } from '../models/SecurityModels';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputText } from '../../../components/common/FormComponents/FormInputText';
import { FormInputSelect } from '../../../components/common/FormComponents/FormInputSelect';
import { platforms } from '../../../utils/platforms';
import Security from '../../../assets/svgs/security.svg';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../../hooks/useNotifier';
import Image from 'next/image';
import { CopyAllOutlined } from '@mui/icons-material';

interface Props {
  handleClose: () => void;
  client: IClient;
  availableClients: IClient[];
  onSubmit: (arg: { _id: string; data: IUpdateClient }) => void;
}

const UpdateSecurityClient: React.FC<Props> = ({
  handleClose,
  client,
  availableClients,
  onSubmit,
}) => {
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

  const foundAlias = (value: string) => availableClients.some((client) => client.alias === value);

  const existingAlias = (value: string) => value === client?.alias;

  const handleSubmit = (data: IClient) => {
    if (isWeb && (!data.domain || data.domain.length === 0)) {
      dispatch(enqueueErrorNotification(`Domain needs to be set for web clients`));
      return;
    }
    if (isWeb) {
      const formattedData = {
        alias: data.alias !== '' ? data.alias : undefined,
        notes: data.notes,
        domain: data.domain,
      };
      onSubmit({ _id: data._id, data: formattedData });
    } else {
      const formattedData = {
        alias: data.alias !== '' ? data.alias : undefined,
        notes: data.notes,
      };
      onSubmit({ _id: data._id, data: formattedData });
    }
    handleClose();
  };

  const handleCopyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    dispatch(enqueueSuccessNotification(`Client ID copied to clipboard!`));
  };

  return (
    <Box>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Box display="flex" flexDirection="column" gap={3} p={3}>
            <FormInputText
              disabled
              name={'clientId'}
              label={'Client ID'}
              aria-readonly
              textFieldProps={{
                InputProps: {
                  endAdornment: (
                    <IconButton
                      disableRipple
                      onClick={() => handleCopyToClipboard(methods.getValues('clientId'))}>
                      <CopyAllOutlined />
                    </IconButton>
                  ),
                },
              }}
            />
            <FormInputText
              name={'alias'}
              label={'Alias'}
              rules={{
                validate: (value) =>
                  !foundAlias(value) || existingAlias(value) || 'Alias already exists',
              }}
            />
            {isWeb && <FormInputText name={'domain'} label={'domain'} />}
            <FormInputText
              name={'notes'}
              label={'Notes'}
              textFieldProps={{ multiline: true, rows: 10 }}
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
            <Button variant={'contained'} type="submit" color={'primary'} fullWidth>
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
