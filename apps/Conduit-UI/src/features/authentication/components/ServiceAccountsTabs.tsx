import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import React, { useEffect, useState } from 'react';
import {
  getServiceAccounts,
  deleteServiceAccounts,
  createServiceAccount,
  refreshServiceAccount,
} from '../../settings/http/SettingsRequests';
import {
  ConfirmationDialog,
  DataTable,
  LinkComponent,
  ConduitTooltip,
} from '@conduitplatform/ui-components';
import GetServiceAccountToken from './GetServiceAccountToken';
import CreateServiceAccount from './CreateServiceAccount';
import { ServiceAccount } from '../models/AuthModels';
import { Box, Icon } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { asyncGetAuthenticationConfig } from '../store/authenticationSlice';
import { Warning } from '@mui/icons-material';

interface ServiceAccountsUI {
  _id: string;
  name: string;
  active: string;
  updatedAt: string;
}

const ServiceAccountsTabs = () => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [serviceId, setServiceId] = useState<string>('');
  const [tokenDialog, setTokenDialog] = useState<boolean>(false);
  const [confirmation, setConfirmation] = useState<boolean>(false);
  const [createdService, setCreatedService] = useState<{ name: string; token: string }>({
    name: '',
    token: '',
  });
  const [serviceAccounts, setServiceAccounts] = useState<ServiceAccount[]>([]);
  const [sort, setSort] = useState<{ asc: boolean; index: string | null }>({
    asc: false,
    index: null,
  });
  const enabledConfig = useAppSelector(
    (state) => state.authenticationSlice.data.config.service.enabled
  );

  const fetchServiceAccounts = async () => {
    try {
      const axiosResponse = await getServiceAccounts();
      if (axiosResponse.data && axiosResponse.data.services) {
        const services = axiosResponse.data.services;
        setServiceAccounts(services);
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    dispatch(asyncGetAuthenticationConfig());
  }, [dispatch]);

  useEffect(() => {
    fetchServiceAccounts();
  }, []);

  const handleDeleteClick = (_id: string) => {
    setServiceId(_id);
    setConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setServiceId('');
    setConfirmation(false);
  };

  const handleDeletion = async () => {
    handleCloseConfirmation();
    try {
      await deleteServiceAccounts(serviceId);
      await fetchServiceAccounts();
    } catch (error) {
      throw error;
    }
  };

  const handleGenerateNew = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseTokenDialog = () => {
    setTokenDialog(false);
    setCreatedService({ name: '', token: '' });
  };

  const handleCreate = async () => {
    if (name) {
      try {
        const response = await createServiceAccount(name);
        handleClose();
        setTokenDialog(true);
        setCreatedService(response.data);
        await fetchServiceAccounts();
      } catch (error) {
        throw error;
      }
    }
  };

  const handleRefresh = async (serviceId: string) => {
    try {
      const response = await refreshServiceAccount(serviceId);
      handleClose();
      setTokenDialog(true);
      setCreatedService(response.data);
      await fetchServiceAccounts();
    } catch (error) {
      throw error;
    }
  };

  const toDelete = {
    title: 'Delete',
    type: 'delete',
  };

  const toRefresh = {
    title: 'Refresh',
    type: 'sync',
  };

  const handleAction = (action: { title: string; type: string }, data: ServiceAccountsUI) => {
    const currentServiceAccount = serviceAccounts?.find((account) => account.name === data.name);
    if (currentServiceAccount !== undefined) {
      if (action.type === 'delete') {
        handleDeleteClick(currentServiceAccount._id);
        return;
      }
      if (action.type === 'sync') {
        handleRefresh(currentServiceAccount._id);
      }
    }
  };

  const actions = [toDelete, toRefresh];

  const headers = [
    { title: '_id', sort: '_id' },
    { title: 'Name', sort: 'name' },
    { title: 'Active', sort: 'active' },
    { title: 'Created at', sort: 'createdAt' },
  ];

  const formatData = (data: ServiceAccount[]) => {
    return data.map((u) => {
      return {
        _id: u._id,
        name: u.name,
        Active: u.active,
        CreatedAt: u.createdAt,
      };
    });
  };

  return (
    <>
      <Box pb={3} display="flex" justifyContent="space-between">
        <Box>
          <Box display="flex" gap={3} alignItems="center">
            <Typography variant={'h6'}>All available Service Accounts</Typography>
            {!enabledConfig && (
              <ConduitTooltip
                title={
                  <Box display="flex" flexDirection="column" gap={1} p={2}>
                    <Typography variant="body2">Services are currently disabled!</Typography>
                    <Typography variant="body2">
                      You can enable them via the
                      <LinkComponent href="/authentication/config" underline={'none'}>
                        <Button>config tab</Button>
                      </LinkComponent>
                    </Typography>
                  </Box>
                }>
                <Icon color="error" sx={{ display: 'flex' }}>
                  <Warning />
                </Icon>
              </ConduitTooltip>
            )}
          </Box>
          <Typography variant={'subtitle1'}>
            Create, delete, refresh your Service Accounts
          </Typography>
        </Box>
        <Box>
          <Button
            variant={'contained'}
            color={'primary'}
            sx={{ width: 170 }}
            disabled={!enabledConfig}
            onClick={handleGenerateNew}>
            Generate new Service Account
          </Button>
        </Box>
      </Box>
      {serviceAccounts.length === 0 && (
        <Typography textAlign="center" pt={20}>
          No available service accounts
        </Typography>
      )}
      {serviceAccounts.length > 0 && (
        <DataTable
          selectable={false}
          sort={sort}
          setSort={setSort}
          headers={headers}
          dsData={formatData(serviceAccounts)}
          actions={actions}
          handleAction={handleAction}
        />
      )}

      <ConfirmationDialog
        open={confirmation}
        handleClose={handleCloseConfirmation}
        buttonAction={handleDeletion}
        buttonText={'Delete'}
        title={'Delete selected Service Account'}
      />
      <GetServiceAccountToken
        open={tokenDialog}
        handleClose={handleCloseTokenDialog}
        token={createdService.token}
      />
      <CreateServiceAccount
        open={open}
        name={name}
        setName={setName}
        handleClose={handleClose}
        handleCreate={handleCreate}
      />
    </>
  );
};

export default ServiceAccountsTabs;
