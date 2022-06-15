import {
  Button,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import ClientPlatformEnum, { IClient } from '../../models/security/SecurityModels';
import { asyncDeleteClient, asyncGetAvailableClients } from '../../redux/slices/securitySlice';
import { useAppSelector } from '../../redux/store';
import CreateSecurityClientDialog from './CreateSecurityClientDialog';
import { Add, CopyAllOutlined, Edit } from '@mui/icons-material';
import UpdateSecurityClientDialog from './UpdateSecurityClient';
import { enqueueSuccessNotification } from '../../utils/useNotifier';
import { SideDrawerWrapper } from '@conduitplatform/ui-components';

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

const ClientsTab: React.FC = () => {
  const dispatch = useDispatch();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [updateDialog, setUpdateDialog] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<IClient>(emptyClient);

  useEffect(() => {
    dispatch(asyncGetAvailableClients());
  }, [dispatch]);

  const { availableClients } = useAppSelector((state) => state.securitySlice.data);

  const handleDeletion = (_id: string) => {
    dispatch(asyncDeleteClient(_id));
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const handleCloseUpdateDialog = () => {
    setUpdateDialog(false);
    setSelectedClient(emptyClient);
  };

  const handleCopyToClipboard = (info: IClient) => {
    navigator.clipboard.writeText(info.clientSecret);
    dispatch(enqueueSuccessNotification(`Client secret copied to clipboard!`));
  };

  const handleOpenUpdateDialog = (client: IClient) => {
    setSelectedClient(client);
    setUpdateDialog(true);
  };

  return (
    <Container>
      <Paper sx={{ p: 4, borderRadius: 8 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant={'h6'}>Available Security Clients</Typography>
          <Button variant="outlined" onClick={() => setOpenDialog(true)}>
            {<Add />}
            {smallScreen ? undefined : <Typography>Generate</Typography>}
          </Button>
        </Box>
        <Box display="flex" justifyContent="center" mt={2}>
          <TableContainer sx={{ maxHeight: '69vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableCell
                  sx={{
                    backgroundColor: 'background.paper',
                  }}>
                  Client ID
                </TableCell>
                <TableCell sx={{ backgroundColor: 'background.paper' }}>Alias</TableCell>
                <TableCell sx={{ backgroundColor: 'background.paper' }}>Platform</TableCell>
                <TableCell sx={{ backgroundColor: 'background.paper' }}>Domain</TableCell>
                <TableCell sx={{ backgroundColor: 'background.paper' }}>Notes</TableCell>
                <TableCell sx={{ backgroundColor: 'background.paper' }} />
              </TableHead>
              <TableBody>
                {availableClients?.map((client: IClient, index: number) => (
                  <TableRow key={index}>
                    <TableCell
                      sx={{ maxWidth: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Typography variant={'caption'}>{client.clientId}</Typography>
                    </TableCell>
                    <TableCell
                      sx={{ maxWidth: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Typography variant={'caption'}>{client.alias || 'N/A'}</Typography>
                    </TableCell>

                    <TableCell sx={{ maxWidth: '20px' }}>
                      <Typography variant={'caption'}>{client.platform}</Typography>
                    </TableCell>
                    <TableCell
                      sx={{ maxWidth: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Typography variant={'caption'}>{client.domain || 'N/A'}</Typography>
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
                        {client.clientSecret && (
                          <Tooltip title="Copy secret to clipboard">
                            <IconButton onClick={() => handleCopyToClipboard(client)}>
                              <CopyAllOutlined color="secondary" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete security client">
                          <IconButton onClick={() => handleDeletion(client._id)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit security client">
                          <IconButton onClick={() => handleOpenUpdateDialog(client)}>
                            <Edit color="secondary" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
      <CreateSecurityClientDialog open={openDialog} handleClose={handleClose} />
      <SideDrawerWrapper
        open={updateDialog}
        title={`Edit client ${selectedClient._id}`}
        closeDrawer={() => handleCloseUpdateDialog()}
        width={750}>
        <UpdateSecurityClientDialog handleClose={handleCloseUpdateDialog} client={selectedClient} />
      </SideDrawerWrapper>
    </Container>
  );
};

export default ClientsTab;

//TODO We don't get an _id from the server for each new client we create
// so as a workaround we have to refetch-all client in
// TODO order to be able delete newly made clients
