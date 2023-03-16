import {
  Button,
  Container,
  Icon,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useEffect, useMemo, useState } from 'react';
import ClientPlatformEnum, { IClient, IUpdateClient } from '../models/SecurityModels';
import {
  asyncDeleteClient,
  asyncGetAvailableClients,
  asyncPutRouterConfig,
  asyncUpdateClient,
  clearClientSecret,
} from '../store/routerSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import CreateSecurityClientDialog from './CreateSecurityClientDialog';
import { Add, Edit, InfoOutlined, KeyboardArrowDown } from '@mui/icons-material';
import UpdateSecurityClient from './UpdateSecurityClient';
import {
  ConfigSaveSection,
  SideDrawerWrapper,
  ConduitTooltip,
} from '@conduitplatform/ui-components';
import ClientSecretDialog from './ClientSecretDialog';
import { prepareSort } from '../../../utils/prepareSort';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { IRouterConfig } from '../models/RouterModels';
import { FormInputSwitch } from '../../../components/common/FormComponents/FormInputSwitch';
import { enqueueErrorNotification, enqueueSuccessNotification } from '../../../hooks/useNotifier';
import { getErrorData } from '../../../utils/error-handler';

const emptyClient = {
  _id: '',
  clientId: '',
  clientSecret: '',
  domain: '',
  platform: ClientPlatformEnum.WEB,
  notes: '',
  alias: '',
  createdAt: '',
  updatedAt: '',
};

const SecurityTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [updateDialog, setUpdateDialog] = useState<boolean>(false);
  const [secretDialog, setSecretDialog] = useState<boolean>(false);
  const [sort, setSort] = useState<{ asc: boolean; index: string | null }>({
    asc: false,
    index: null,
  });
  const [selectedClient, setSelectedClient] = useState<IClient>(emptyClient);
  const [edit, setEdit] = useState<boolean>(false);
  const { config } = useAppSelector((state) => state.routerSlice.data);

  const methods = useForm<IRouterConfig>({
    defaultValues: useMemo(() => {
      return config;
    }, [config]),
  });

  const { reset, control, register } = methods;

  useEffect(() => {
    methods.reset(config);
  }, [methods, config]);

  useEffect(() => {
    if (config.security.clientValidation) {
      dispatch(asyncGetAvailableClients({ sort: prepareSort(sort) }));
    }
  }, [config.security.clientValidation, dispatch, sort]);

  const isActive = useWatch({
    control,
    name: 'security.clientValidation',
  });

  const { availableClients } = useAppSelector((state) => state.routerSlice.data);

  const handleDeletion = (_id: string) => {
    dispatch(asyncDeleteClient(_id));
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const handleSuccessfullClientCreation = () => {
    setOpenDialog(false);

    setTimeout(() => {
      setSecretDialog(true);
    }, 1500);
  };

  const handleCloseUpdateDialog = () => {
    setUpdateDialog(false);
    setSelectedClient(emptyClient);
  };

  const handleCloseSecretDialog = () => {
    setSecretDialog(false);
    dispatch(clearClientSecret());
  };

  const handleOpenUpdateDialog = (client: IClient) => {
    setSelectedClient(client);
    setUpdateDialog(true);
  };

  const headCells = [
    { label: 'Client ID', sort: 'clientId' },
    { label: 'Alias', sort: 'alias' },
    { label: 'Platform', sort: 'platform' },
    { label: 'Domain', sort: 'domain' },
    { label: 'Notes', sort: 'notes' },
  ];

  const onSelectedField = (index: string) => {
    if (setSort !== undefined)
      setSort((prevState: { asc: boolean; index: string | null }) => {
        if (prevState.index === index) {
          return { asc: !prevState.asc, index: index };
        }
        return { asc: prevState.asc, index: index };
      });
  };

  const handleDirection = (dir: boolean) => {
    if (dir) {
      return 'asc';
    }
    return 'desc';
  };

  const onSubmit = (data: IRouterConfig) => {
    const finalData = {
      ...config,
      security: { clientValidation: data.security.clientValidation },
    };
    dispatch(asyncPutRouterConfig(finalData));
    setEdit(false);
  };

  const handleCancel = () => {
    setEdit(!edit);
    reset();
  };

  const handleCopyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    dispatch(enqueueSuccessNotification(`Client ID copied to clipboard!`));
  };

  const handleUpdateSecurityClient = async (arg: { _id: string; data: IUpdateClient }) => {
    try {
      await dispatch(asyncUpdateClient(arg)).unwrap();
      dispatch(asyncGetAvailableClients({ sort: prepareSort(sort) }));
    } catch (error) {
      dispatch(enqueueErrorNotification(`${getErrorData(error)}`));
    }
  };

  return (
    <Container maxWidth={'md'} sx={{ background: 'text.primary' }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 8 }}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Box
              width={'100%'}
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant={'h6'}>Require Client ID / Validation</Typography>

                <ConduitTooltip
                  title={
                    <Box display="flex" flexDirection="column" gap={2} p={2}>
                      <Typography variant="body2">
                        Security client validation introduces an additional security layer for your
                        application requests. Upon enabling this option any client requests going
                        through your transport APIs are going to have to provide a client id/secret
                        pair before their request can be forwarded to the appropriate module.
                      </Typography>
                      <Box display="flex" justifyContent="flex-end">
                        <a
                          href="https://getconduit.dev/docs/modules/router/security"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}>
                          <Button variant="outlined">Take me to the docs</Button>
                        </a>
                      </Box>
                    </Box>
                  }>
                  <Icon sx={{ display: 'flex' }}>
                    <InfoOutlined />
                  </Icon>
                </ConduitTooltip>
              </Box>
              <FormInputSwitch {...register('security.clientValidation')} disabled={!edit} />
            </Box>

            {isActive ? (
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                  {availableClients.length > 0 ? (
                    <Typography variant={'h6'}>Available Security Clients</Typography>
                  ) : (
                    <Box />
                  )}
                  <Button variant="contained" onClick={() => setOpenDialog(true)}>
                    {<Add />}
                    {smallScreen ? undefined : <Typography>Generate</Typography>}
                  </Button>
                </Box>
                <Box display="flex" justifyContent="center" mt={2}>
                  {availableClients.length > 0 && (
                    <TableContainer sx={{ maxHeight: '49vh' }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            {headCells.map((headCell) => (
                              <TableCell
                                sx={{ backgroundColor: 'background.paper' }}
                                key={headCell.sort}>
                                <TableSortLabel
                                  IconComponent={KeyboardArrowDown}
                                  active={sort?.index === headCell.sort}
                                  direction={handleDirection(sort?.asc)}
                                  onClick={() => onSelectedField(headCell.sort)}>
                                  <Typography variant="body2">{headCell.label}</Typography>
                                </TableSortLabel>
                              </TableCell>
                            ))}
                            <TableCell sx={{ backgroundColor: 'background.paper' }} />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {availableClients?.map((client: IClient, index: number) => (
                            <TableRow key={index}>
                              <TableCell
                                sx={{
                                  maxWidth: '40px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}>
                                <Typography
                                  variant={'caption'}
                                  color={'primary'}
                                  onClick={() => handleCopyToClipboard(client.clientId)}
                                  sx={{ cursor: 'pointer' }}>
                                  {client.clientId}
                                </Typography>
                              </TableCell>
                              <TableCell
                                sx={{
                                  maxWidth: '40px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}>
                                <Typography variant={'caption'}>{client.alias || 'N/A'}</Typography>
                              </TableCell>

                              <TableCell sx={{ maxWidth: '20px' }}>
                                <Typography variant={'caption'}>{client.platform}</Typography>
                              </TableCell>
                              <TableCell
                                sx={{
                                  maxWidth: '40px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}>
                                <Typography variant={'caption'}>
                                  {client.domain || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell
                                sx={{
                                  whiteSpace: 'nowrap',
                                  maxWidth: '100px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}>
                                <Typography variant={'caption'}>{client.notes || 'N/A'}</Typography>
                              </TableCell>

                              <TableCell>
                                <Box display="flex" justifyContent="flex-end" gap={1}>
                                  <Tooltip title="Delete security client">
                                    <IconButton onClick={() => handleDeletion(client._id)}>
                                      <DeleteIcon color={'error'} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit security client">
                                    <IconButton onClick={() => handleOpenUpdateDialog(client)}>
                                      <Edit color={'primary'} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>

                <CreateSecurityClientDialog
                  open={openDialog}
                  availableClients={availableClients}
                  handleClose={handleClose}
                  handleSuccess={handleSuccessfullClientCreation}
                />
                <ClientSecretDialog open={secretDialog} handleClose={handleCloseSecretDialog} />
                <SideDrawerWrapper
                  open={updateDialog}
                  title={`Edit client ${selectedClient._id}`}
                  closeDrawer={() => handleCloseUpdateDialog()}
                  width={750}>
                  <UpdateSecurityClient
                    availableClients={availableClients}
                    handleClose={handleCloseUpdateDialog}
                    client={selectedClient}
                    onSubmit={handleUpdateSecurityClient}
                  />
                </SideDrawerWrapper>
              </>
            ) : null}
            <Box mt={2}>
              <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
            </Box>
          </form>
        </FormProvider>
      </Paper>
    </Container>
  );
};

export default SecurityTab;

//TODO We don't get an _id from the server for each new client we create
// so as a workaround we have to refetch-all client in
// TODO order to be able delete newly made clients
