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
  TableSortLabel,
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
import {
  asyncDeleteClient,
  asyncGetAvailableClients,
  clearClientSecret,
} from '../../redux/slices/securitySlice';
import { useAppSelector } from '../../redux/store';
import CreateSecurityClientDialog from './CreateSecurityClientDialog';
import { Add, Edit, KeyboardArrowDown } from '@mui/icons-material';
import UpdateSecurityClient from './UpdateSecurityClient';
import { SideDrawerWrapper } from '@conduitplatform/ui-components';
import ClientSecretDialog from './ClientSecretDialog';
import { prepareSort } from '../../utils/prepareSort';

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
  const [secretDialog, setSecretDialog] = useState<boolean>(false);
  const [sort, setSort] = useState<{ asc: boolean; index: string | null }>({
    asc: false,
    index: null,
  });
  const [selectedClient, setSelectedClient] = useState<IClient>(emptyClient);

  useEffect(() => {
    dispatch(asyncGetAvailableClients({ sort: prepareSort(sort) }));
  }, [dispatch, sort]);

  const { availableClients } = useAppSelector((state) => state.securitySlice.data);

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

  return (
    <Container>
      <Paper sx={{ p: 4, borderRadius: 8 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant={'h6'}>Available Security Clients</Typography>
          <Button variant="contained" onClick={() => setOpenDialog(true)}>
            {<Add />}
            {smallScreen ? undefined : <Typography>Generate</Typography>}
          </Button>
        </Box>
        <Box display="flex" justifyContent="center" mt={2}>
          <TableContainer sx={{ maxHeight: '69vh' }}>
            <Table stickyHeader>
              <TableHead>
                {headCells.map((headCell) => (
                  <TableCell sx={{ backgroundColor: 'background.paper' }} key={headCell.sort}>
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
        />
      </SideDrawerWrapper>
    </Container>
  );
};

export default ClientsTab;

//TODO We don't get an _id from the server for each new client we create
// so as a workaround we have to refetch-all client in
// TODO order to be able delete newly made clients
