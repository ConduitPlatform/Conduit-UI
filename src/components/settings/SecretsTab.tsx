import {
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
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
import ClientPlatformEnum from '../../models/ClientPlatformEnum';
import Button from '@mui/material/Button';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { IClient, IPlatformTypes } from '../../models/settings/SettingsModels';
import {
  asyncDeleteClient,
  asyncGenerateNewClient,
  asyncGetAvailableClients,
} from '../../redux/slices/settingsSlice';
import { useAppSelector } from '../../redux/store';

const SecretsTab: React.FC = () => {
  const dispatch = useDispatch();

  const [platform, setPlatform] = useState<IPlatformTypes>('WEB');

  const handleGenerateNew = () => {
    dispatch(asyncGenerateNewClient(platform));
    setTimeout(() => {
      dispatch(asyncGetAvailableClients());
    }, 140);
  };
  //TODO We don't get an _id from the server for each new client we create
  // so as a workaround we have to refetch-all client in
  // TODO order to be able delete newly made clients

  useEffect(() => {
    dispatch(asyncGetAvailableClients());
  }, [dispatch]);

  const { availableClients } = useAppSelector((state) => state.settingsSlice.data);

  const handleDeletion = (_id: string) => {
    dispatch(asyncDeleteClient(_id));
  };

  return (
    <Container>
      <Paper sx={{ p: 4, borderRadius: 8 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant={'h6'}>Available conduit Clients</Typography>
          <Box display="flex" gap={1} justifyContent="space-between" alignItems="center">
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Platform</InputLabel>
              <Select
                size="small"
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Platform"
                value={platform}
                onChange={(event: any) => setPlatform(event.target.value)}>
                <MenuItem value={ClientPlatformEnum.WEB}>WEB</MenuItem>
                <MenuItem value={ClientPlatformEnum.ANDROID}>ANDROID</MenuItem>
                <MenuItem value={ClientPlatformEnum.IOS}>IOS</MenuItem>
                <MenuItem value={ClientPlatformEnum.IPADOS}>IPADOS</MenuItem>
                <MenuItem value={ClientPlatformEnum.LINUX}>LINUX</MenuItem>
                <MenuItem value={ClientPlatformEnum.MACOS}>MACOS</MenuItem>
                <MenuItem value={ClientPlatformEnum.WINDOWS}>WINDOWS</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant={'contained'}
              color={'primary'}
              size="small"
              fullWidth
              onClick={handleGenerateNew}>
              Generate new Client
            </Button>
          </Box>
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
    </Container>
  );
};

export default SecretsTab;
