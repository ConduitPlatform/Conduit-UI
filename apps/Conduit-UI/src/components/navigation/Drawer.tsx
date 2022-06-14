import React from 'react';
import { Box, Paper, useMediaQuery, useTheme } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import { ExitToApp, Security, Settings } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { asyncLogout } from '../../redux/slices/appAuthSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import Modules from '../modules/Modules';
import { ModuleItem } from '@conduitplatform/ui-components';
import ConduitLogo from '../../assets/svgs/conduitLogo.svg';
import Image from 'next/image';
import { LinkComponent } from '@conduitplatform/ui-components';

interface Props {
  itemSelected?: string;
}

const CustomDrawer: React.FC<Props> = ({ itemSelected, ...rest }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { enabledModules, disabledModules } = useAppSelector((state) => state.appAuthSlice.data);

  const handleLogout = async () => {
    dispatch(asyncLogout());
    await router.replace('/login');
  };

  return (
    <Paper
      sx={{
        width: smallScreen ? 60 : 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      elevation={2}
      {...rest}>
      <ListItem
        sx={{
          width: smallScreen ? 60 : 200,
          alignItems: 'center',
          justifyContent: 'center',
          mt: 4,
        }}>
        <Image src={ConduitLogo} alt="conduit-logo" />
      </ListItem>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          mt: 4,
          padding: 0,
        }}>
        <List component="nav">
          <Modules
            modules={enabledModules}
            homeEnabled
            itemSelected={itemSelected}
            smallScreen={smallScreen}
          />
          <LinkComponent href="/security/clients" underline={'none'}>
            <ModuleItem
              selected={itemSelected === 'security'}
              icon={<Security color={'inherit'} />}
              title={'Security'}
              smallScreen={smallScreen}
            />
          </LinkComponent>
          <LinkComponent href="/settings/clientsdk" underline={'none'}>
            <ModuleItem
              selected={itemSelected === 'settings'}
              icon={<Settings color={'inherit'} />}
              title={'Settings'}
              smallScreen={smallScreen}
            />
          </LinkComponent>
          {disabledModules.length > 0 ? (
            <>
              <Modules
                modules={disabledModules}
                itemSelected={itemSelected}
                disabled
                smallScreen={smallScreen}
              />
            </>
          ) : (
            <></>
          )}
        </List>
        <Box sx={{ margin: 0, paddingLeft: 0, cursor: 'pointer' }}>
          <ModuleItem
            icon={<ExitToApp color={'inherit'} />}
            title={'Log out'}
            onClick={() => handleLogout()}
            smallScreen={smallScreen}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default CustomDrawer;
