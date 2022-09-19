import React, { useContext } from 'react';
import { Box, Button, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import { ExitToApp, Refresh, Settings } from '@mui/icons-material';
import { asyncGetAdminModules, asyncLogout } from '../../redux/slices/appAuthSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import Modules from '../modules/Modules';
import { ModuleItem, LinkComponent } from '@conduitplatform/ui-components';
import ConduitLogo from '../../assets/svgs/conduitLogo.svg';
import ConduitLogoMini from '../../assets/svgs/conduitLogoMini.svg';
import Image from 'next/image';
import { ColorModeContext } from '../../pages/_app';
import ThemeSwitch from '../common/ThemeSwitch';

interface Props {
  itemSelected?: string;
}

const CustomDrawer: React.FC<Props> = ({ itemSelected, ...rest }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const colorMode = useContext(ColorModeContext);

  const { enabledModules, disabledModules } = useAppSelector((state) => state.appAuthSlice.data);

  const handleLogout = async () => {
    dispatch(asyncLogout());
  };

  const handleRefreshModules = async () => {
    dispatch(asyncGetAdminModules());
  };

  return (
    <Paper
      sx={{
        width: smallScreen ? 60 : 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
      }}
      elevation={0}
      {...rest}>
      <ListItem
        sx={{
          width: smallScreen ? 60 : 200,
          alignItems: 'center',
          justifyContent: 'center',
          mt: 4,
        }}>
        <Image src={smallScreen ? ConduitLogoMini : ConduitLogo} alt="conduit-logo" />
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
          <Modules
            modules={enabledModules}
            homeEnabled
            itemSelected={itemSelected}
            smallScreen={smallScreen}
          />
          <LinkComponent href="/settings/settings">
            <ModuleItem
              selected={itemSelected === 'settings'}
              icon={<Settings color={'inherit'} width={24} height={24} />}
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
        <Box
          sx={{ margin: 0, paddingLeft: 0, cursor: 'pointer' }}
          display="flex"
          flexDirection="column">
          <Box py={2} px={!smallScreen ? 2 : undefined}>
            <ThemeSwitch
              checked={theme.palette.mode === 'dark'}
              onClick={colorMode.toggleColorMode}
            />
          </Box>
          <Box
            px={!smallScreen ? 2 : undefined}
            display={'flex'}
            justifyContent={smallScreen ? 'center' : undefined}>
            <Button
              color={'inherit'}
              size={'small'}
              onClick={handleRefreshModules}
              sx={{
                paddingX: 0,
                minWidth: '35px',
                borderRadius: 1,
              }}>
              <Refresh fontSize={'medium'} />
              {!smallScreen ? (
                <Typography
                  sx={{
                    ml: smallScreen ? 0 : 1,
                    fontSize: 12,
                    textTransform: 'none',
                    fontWeight: theme.palette.mode === 'dark' ? 'bold' : 'regular',
                  }}>
                  Modules
                </Typography>
              ) : null}
            </Button>
          </Box>
          <ModuleItem
            icon={<ExitToApp color={'inherit'} width={24} height={24} />}
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
