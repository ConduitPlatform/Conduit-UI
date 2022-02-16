import React from 'react';
import { Box, Paper, Theme } from '@material-ui/core';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import { ExitToApp, Settings } from '@material-ui/icons';
import { useRouter } from 'next/router';
import { asyncLogout } from '../../redux/slices/appAuthSlice';
import { makeStyles } from '@material-ui/core/styles';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import Modules from '../modules/Modules';
import CustomListItem from './CustomListItem';
import Link from 'next/link';
import ConduitLogo from '../../assets/svgs/conduitLogo.svg';
import Image from 'next/image';

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    minWidth: 224,
    display: 'flex',
    flexDirection: 'column',
  },
  listContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: theme.spacing(3),
  },
  logoutContainer: {
    margin: 0,
    paddingLeft: theme.spacing(1),
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(4),
  },
}));

interface Props {
  itemSelected?: string;
}

const CustomDrawer: React.FC<Props> = ({ itemSelected, ...rest }) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { enabledModules, disabledModules } = useAppSelector((state) => state.appAuthSlice.data);

  const handleLogout = async () => {
    dispatch(asyncLogout());
    await router.replace('/login');
  };

  return (
    <Paper className={classes.drawer} elevation={2} {...rest}>
      <ListItem className={classes.logo}>
        <Image src={ConduitLogo} alt="conduit-logo" />
      </ListItem>
      <div className={classes.listContainer}>
        <List component="nav">
          <Modules modules={enabledModules} homeEnabled itemSelected={itemSelected} />
          <Link href="/settings/clientsdk" passHref>
            <CustomListItem
              selected={itemSelected === 'settings'}
              icon={<Settings color={'inherit'} />}
              title="Settings"
            />
          </Link>
          <Divider />
          {disabledModules.length > 0 ? (
            <>
              <Modules modules={disabledModules} itemSelected={itemSelected} disabled />
            </>
          ) : (
            <></>
          )}
        </List>
        <CustomListItem
          icon={<ExitToApp color={'inherit'} />}
          title="Log out"
          onClick={() => handleLogout()}
          className={classes.logoutContainer}
        />
      </div>
    </Paper>
  );
};

export default CustomDrawer;
