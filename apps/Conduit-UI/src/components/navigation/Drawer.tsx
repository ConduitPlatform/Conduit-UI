import React from 'react';
import { Box, Paper } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import { ExitToApp, Settings } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { asyncLogout } from '../../redux/slices/appAuthSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import Modules from '../modules/Modules';
import { ModuleItem } from 'ui-components';
import Link from 'next/link';
import ConduitLogo from '../../assets/svgs/conduitLogo.svg';
import Image from 'next/image';

interface Props {
  itemSelected?: string;
}

const CustomDrawer: React.FC<Props> = ({ itemSelected, ...rest }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { enabledModules, disabledModules } = useAppSelector((state) => state.appAuthSlice.data);

  const handleLogout = async () => {
    dispatch(asyncLogout());
    await router.replace('/login');
  };

  return (
    <Paper sx={{ minWidth: 224, display: 'flex', flexDirection: 'column' }} elevation={2} {...rest}>
      <ListItem sx={{ alignItems: 'center', justifyContent: 'center', mt: 4 }}>
        <Image src={ConduitLogo} alt="conduit-logo" />
      </ListItem>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          mt: 4,
        }}>
        <List component="nav">
          <Modules modules={enabledModules} homeEnabled itemSelected={itemSelected} />
          <Link href="/settings/clientsdk" passHref>
            <ModuleItem
              selected={itemSelected === 'settings'}
              icon={<Settings color={'inherit'} />}
              title="Settings"
            />
          </Link>
          {disabledModules.length > 0 ? (
            <>
              <Modules modules={disabledModules} itemSelected={itemSelected} disabled />
            </>
          ) : (
            <></>
          )}
        </List>
        <Box sx={{ margin: 0, paddingLeft: 1 }}>
          <ModuleItem
            icon={<ExitToApp color={'inherit'} />}
            title="Log out"
            onClick={() => handleLogout()}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default CustomDrawer;
