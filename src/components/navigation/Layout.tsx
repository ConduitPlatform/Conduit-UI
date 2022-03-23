import React, { useState, useEffect } from 'react';
import CustomDrawer from './Drawer';
import { useRouter } from 'next/router';
import { asyncGetAdminModules } from '../../redux/slices/appAuthSlice';
import { Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import useNotifier from '../../utils/useNotifier';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    padding: 0,
    minHeight: '100vh',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
  snackBar: {
    maxWidth: '80%',
    width: 'auto',
  },
}));

export const Layout: React.FC = ({ children, ...rest }) => {
  useNotifier();
  const classes = useStyles();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.appAuthSlice.data);
  const { loading } = useAppSelector((state) => state.appSlice);
  const [menuDisabled, setMenuDisabled] = useState<boolean>(false);
  const [itemSelected, setItemSelected] = useState<string>('');

  useEffect(() => {
    const splitUri = router.pathname.split('/')[1];
    if (splitUri === 'push-notifications') {
      setItemSelected('pushNotifications');
    } else {
      setItemSelected(splitUri);
    }

    if (router.pathname === '/login' || router.pathname === '/database/schemas/[id]') {
      setMenuDisabled(true);
      return;
    }
    setMenuDisabled(false);
  }, [router.pathname]);

  useEffect(() => {
    if (token) {
      dispatch(asyncGetAdminModules());
    }
  }, [dispatch, token]);

  return (
    <div className={classes.root} {...rest}>
      {!menuDisabled ? <CustomDrawer itemSelected={itemSelected} /> : <></>}
      <main className={classes.content}>{children}</main>
      <Backdrop open={loading} className={classes.backdrop}>
        <CircularProgress color="secondary" />
      </Backdrop>
    </div>
  );
};
