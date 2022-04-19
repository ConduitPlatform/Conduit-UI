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
} from '@mui/material';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { IClient } from '../../models/settings/SettingsModels';
import { asyncDeleteClient, asyncGetAvailableClients } from '../../redux/slices/settingsSlice';
import { useAppSelector } from '../../redux/store';
import SecretsDialog from './SecretsDialog';
import { Add } from '@mui/icons-material';

const SecretsTab: React.FC = () => {
  const dispatch = useDispatch();
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  useEffect(() => {
    dispatch(asyncGetAvailableClients());
  }, [dispatch]);

  const { availableClients } = useAppSelector((state) => state.settingsSlice.data);

  const handleDeletion = (_id: string) => {
    dispatch(asyncDeleteClient(_id));
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  return (
    <Container>
      <Paper sx={{ p: 4, borderRadius: 8 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant={'h6'}>Available Security Clients</Typography>
          <Button startIcon={<Add />} variant="outlined" onClick={() => setOpenDialog(true)}>
            Generate
          </Button>
        </Box>
        <Box display="flex" justifyContent="center" mt={2}>
          <TableContainer sx={{ display: 'flex', justifyContent: 'center', maxHeight: '69vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: 'background.paper' }}>Client ID</TableCell>
                  <TableCell sx={{ backgroundColor: 'background.paper' }}>Client Secret</TableCell>
                  <TableCell sx={{ backgroundColor: 'background.paper' }}>Platform</TableCell>
                  <TableCell sx={{ backgroundColor: 'background.paper' }} />
                  <TableCell sx={{ backgroundColor: 'background.paper' }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {availableClients.map((client: IClient, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant={'caption'}>{client.clientId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ maxWidth: 500 }}>
                        <span style={{ overflowWrap: 'break-word' }}>
                          {client.clientSecret ? client.clientSecret : 'This is a secret'}
                        </span>
                      </Box>
                    </TableCell>
                    <TableCell colSpan={2}>
                      <Typography variant={'caption'}>{client.platform}</Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleDeletion(client._id)} size="large">
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
      <SecretsDialog open={openDialog} handleClose={handleClose} />
    </Container>
  );
};

export default SecretsTab;

//TODO We don't get an _id from the server for each new client we create
// so as a workaround we have to refetch-all client in
// TODO order to be able delete newly made clients
