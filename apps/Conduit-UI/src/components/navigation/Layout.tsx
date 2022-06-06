import React, { useState, useEffect } from 'react';
import CustomDrawer from './Drawer';
import { useRouter } from 'next/router';
import { asyncGetAdminModules } from '../../redux/slices/appAuthSlice';
import { Box } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import useNotifier from '../../utils/useNotifier';

export const Layout: React.FC = ({ children, ...rest }) => {
  useNotifier();

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.appAuthSlice.data);
  const [menuDisabled, setMenuDisabled] = useState<boolean>(false);
  const [itemSelected, setItemSelected] = useState<string>('');

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
    if (token) {
      dispatch(asyncGetAdminModules());
    }
  }, [dispatch, token]);

  return (
    <Box display="flex" {...rest}>
      {!menuDisabled ? <CustomDrawer itemSelected={itemSelected} /> : <></>}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          padding: 0,
          minHeight: '100vh',
        }}>
        {children}
      </Box>
    </Box>
  );
};
