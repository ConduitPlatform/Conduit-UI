import React, { useState, useEffect, useRef } from 'react';
import CustomDrawer from './Drawer';
import { useRouter } from 'next/router';
import { asyncInitialData } from '../../redux/slices/appAuthSlice';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import useNotifier from '../../utils/useNotifier';

export const Layout: React.FC = ({ children, ...rest }) => {
  useNotifier();

  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { token } = useAppSelector((state) => state.appAuthSlice.data);
  const [menuDisabled, setMenuDisabled] = useState<boolean>(false);
  const [itemSelected, setItemSelected] = useState<string>('');
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const getInitial = useRef(false);

  useEffect(() => {
    const splitUri = router.pathname.split('/')[1];
    if (splitUri === 'push-notifications') {
      setItemSelected('pushNotifications');
    } else {
      setItemSelected(splitUri);
    }

    if (
      router.pathname === '/login' ||
      router.pathname === '/database/schemas/[id]' ||
      router.pathname === '/database/introspection/[id]'
    ) {
      setMenuDisabled(true);
      return;
    }
    setMenuDisabled(false);
  }, [router.pathname]);

  useEffect(() => {
    if (!getInitial.current && token) {
      dispatch(asyncInitialData());
      getInitial.current = true;
    } else if (getInitial.current && !token) {
      getInitial.current = false;
    }
  }, [dispatch]);

  return (
    <Box display="flex" {...rest}>
      {!menuDisabled ? <CustomDrawer itemSelected={itemSelected} /> : <></>}
      <Box
        sx={{
          overflowY: 'auto',
          left: smallScreen ? 60 : 200,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: 0,
          minHeight: '100vh',
        }}>
        {children}
      </Box>
    </Box>
  );
};
